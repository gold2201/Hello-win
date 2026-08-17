from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from src.apps.slot.models import SlotSpin
from src.apps.users.models import User


class UserProfileTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="profileuser", password="testpass")
        self.profile = self.user.profile
        self.profile.balance = 200
        self.profile.total_spins = 5
        self.profile.save()

        SlotSpin.objects.create(user=self.user, bet=5, win_amount=10)
        SlotSpin.objects.create(user=self.user, bet=10, win_amount=0)

    def test_get_profile_authenticated(self):
        self.client.force_authenticate(user=self.user)
        url = reverse("user_profile")
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        self.assertEqual(data["id"], str(self.user.id))
        self.assertEqual(data["username"], "profileuser")
        self.assertEqual(data["balance"], 200)
        self.assertEqual(data["total_spins"], 5)
        self.assertEqual(len(data["spin_history"]), 2)

        first_spin = data["spin_history"][0]
        self.assertIn("id", first_spin)
        self.assertIn("bet", first_spin)
        self.assertIn("win_amount", first_spin)
        self.assertIn("created_at", first_spin)

    def test_get_profile_unauthenticated(self):
        url = reverse("user_profile")
        response = self.client.get(url)
        self.assertIn(
            response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN]
        )
