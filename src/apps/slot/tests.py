from decimal import ROUND_HALF_UP, Decimal
from unittest.mock import patch

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from ..users.models import User
from .models import SlotSpin
from .services import SYMBOLS, calculate_win, generate_matrix, process_spin


class SlotServiceTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="testpass")
        self.profile = self.user.profile

    def test_generate_matrix_returns_4x4(self):
        matrix = generate_matrix()
        self.assertEqual(len(matrix), 4)
        for row in matrix:
            self.assertEqual(len(row), 4)
            for cell in row:
                self.assertIn(cell, [s["symbol"] for s in SYMBOLS])

    def test_calculate_win_detects_all_runs_in_any_position(self):
        matrix = [
            ["🍒", "🍒", "🍋", "🍋"],
            ["🍒", "🍒", "🍋", "🍋"],
            ["🍒", "🍒", "🍋", "🍋"],
            ["🍒", "🍒", "🍋", "🍋"],
        ]
        bet = 5
        result = calculate_win(matrix, bet)

        self.assertEqual(len(result["combinations"]), 12)

        horizontal = [c for c in result["combinations"] if c["direction"] == "horizontal"]
        self.assertEqual(len(horizontal), 8)

        vertical = [c for c in result["combinations"] if c["direction"] == "vertical"]
        self.assertEqual(len(vertical), 4)

        expected_multiplier = Decimal("40")
        self.assertEqual(result["total_multiplier"], expected_multiplier)
        self.assertEqual(result["total_win"], Decimal(bet) * expected_multiplier)

    def test_calculate_win_no_win(self):
        matrix = [
            ["🍒", "🍋", "🔔", "💎"],
            ["🍋", "🔔", "💎", "🍒"],
            ["🔔", "💎", "🍒", "🍋"],
            ["💎", "🍒", "🍋", "🔔"],
        ]
        result = calculate_win(matrix, 10)
        self.assertEqual(len(result["combinations"]), 0)
        self.assertEqual(result["total_win"], Decimal("0"))
        self.assertEqual(result["total_multiplier"], Decimal("0"))

    @patch("src.apps.slot.services.generate_matrix")
    def test_process_spin_success(self, mock_generate):
        matrix = [
            ["🍒", "🍒", "🍋", "🔔"],
            ["💎", "🍋", "🍋", "🔔"],
            ["🍋", "💎", "🍋", "🍒"],
            ["🔔", "🍋", "💎", "🍒"],
        ]
        mock_generate.return_value = matrix
        bet = 5

        result = process_spin(self.user, bet)

        expected_raw = Decimal("22.5")
        expected_rounded = int(expected_raw.quantize(Decimal("1"), rounding=ROUND_HALF_UP))
        self.assertEqual(result["win_amount"], expected_rounded)
        self.assertEqual(result["balance"], 100 - bet + expected_rounded)
        self.assertEqual(result["total_spins"], 1)

        self.profile.refresh_from_db()
        self.assertEqual(self.profile.balance, 100 - bet + expected_rounded)
        self.assertEqual(self.profile.total_spins, 1)

        spin = SlotSpin.objects.get(user=self.user)
        self.assertEqual(spin.bet, bet)
        self.assertEqual(spin.win_amount, expected_rounded)

    def test_process_spin_insufficient_balance(self):
        self.profile.balance = 4
        self.profile.save()

        with self.assertRaises(ValueError):
            process_spin(self.user, 5)

        self.profile.refresh_from_db()
        self.assertEqual(self.profile.balance, 4)
        self.assertEqual(SlotSpin.objects.count(), 0)

    @patch("src.apps.slot.services.generate_matrix")
    def test_process_spin_rounding_half_up(self, mock_generate):
        matrix = [
            ["🍒", "🍒", "🍋", "🔔"],
            ["💎", "🍋", "🔔", "🍒"],
            ["🍋", "💎", "🍒", "🔔"],
            ["🔔", "🍋", "💎", "🍒"],
        ]
        mock_generate.return_value = matrix

        result = process_spin(self.user, 5)

        self.assertEqual(result["win_amount"], 3)
        self.assertEqual(result["balance"], 100 - 5 + 3)
        self.assertEqual(result["total_win_multiplier"], Decimal("0.60"))


class SlotAPITests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="apiuser", password="testpass")
        self.profile = self.user.profile
        self.client.force_authenticate(user=self.user)

    def test_slot_state(self):
        url = reverse("slot_state")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], "apiuser")
        self.assertEqual(response.data["balance"], 100)
        self.assertEqual(response.data["total_spins"], 0)
        self.assertEqual(response.data["bet_options"], [5, 10, 25, 50, 100])

    def test_spin_success(self):
        url = reverse("slot_spin")
        response = self.client.post(url, {"bet": 5}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        for field in ["matrix", "win_amount", "balance", "total_spins", "combinations"]:
            self.assertIn(field, response.data)

        self.profile.refresh_from_db()
        self.assertEqual(response.data["total_spins"], self.profile.total_spins)
        self.assertGreater(self.profile.total_spins, 0)

        self.assertEqual(SlotSpin.objects.count(), 1)

    def test_spin_insufficient_balance(self):
        self.profile.balance = 3
        self.profile.save()
        url = reverse("slot_spin")
        response = self.client.post(url, {"bet": 5}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("detail", response.data)

    def test_slot_state_requires_authentication(self):
        unauth_client = APIClient()
        url = reverse("slot_state")
        response = unauth_client.get(url)
        self.assertIn(
            response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN]
        )
