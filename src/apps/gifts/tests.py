from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from src.apps.gifts.models import Gift, GiftPurchase
from src.apps.users.models import User


class GiftsTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="giftuser", password="testpass")
        self.other_user = User.objects.create_user(username="otheruser", password="testpass")
        self.profile = self.user.profile
        self.profile.balance = 100
        self.profile.total_spins = 50
        self.profile.save()

        self.gift_available = Gift.objects.create(
            user=self.user,
            name="Gift1",
            description="Подарок 1",
            price=20,
            required_spins=10,
            quantity=3,
            is_active=True,
        )

        self.gift_need_more_spins = Gift.objects.create(
            user=self.user,
            name="Gift2",
            description="Подарок 2",
            price=30,
            required_spins=100,
            quantity=1,
            is_active=True,
        )

        self.other_user_gift = Gift.objects.create(
            user=self.other_user,
            name="Gift3",
            description="Чужой подарок",
            price=10,
            required_spins=0,
            quantity=5,
            is_active=True,
        )

    def test_list_gifts_authenticated(self):
        self.client.force_authenticate(user=self.user)
        url = reverse("gift_list")
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_list_gifts_includes_inactive_and_zero_quantity(self):
        self.gift_available.quantity = 0
        self.gift_available.save()
        self.client.force_authenticate(user=self.user)
        url = reverse("gift_list")
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_buy_gift_with_currency_success(self):
        self.client.force_authenticate(user=self.user)
        url = reverse("gift_buy", kwargs={"gift_id": self.gift_available.pk})
        response = self.client.post(url, {"payment_type": "currency"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.profile.refresh_from_db()
        self.gift_available.refresh_from_db()

        self.assertEqual(self.profile.balance, 80)
        self.assertEqual(self.gift_available.quantity, 2)
        self.assertEqual(GiftPurchase.objects.count(), 1)

        purchase = GiftPurchase.objects.first()
        self.assertEqual(purchase.payment_type, "currency")
        self.assertEqual(purchase.user, self.user)
        self.assertEqual(purchase.gift, self.gift_available)

    def test_get_gift_with_spins_success(self):
        self.client.force_authenticate(user=self.user)
        url = reverse("gift_buy", kwargs={"gift_id": self.gift_available.pk})
        response = self.client.post(url, {"payment_type": "spins"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.profile.refresh_from_db()
        self.gift_available.refresh_from_db()

        self.assertEqual(self.profile.balance, 100)
        self.assertEqual(self.profile.total_spins, 50)
        self.assertEqual(self.gift_available.quantity, 2)
        self.assertEqual(GiftPurchase.objects.count(), 1)

        purchase = GiftPurchase.objects.first()
        self.assertEqual(purchase.payment_type, "spins")

    def test_buy_gift_insufficient_currency(self):
        self.profile.balance = 10
        self.profile.save()
        self.client.force_authenticate(user=self.user)
        url = reverse("gift_buy", kwargs={"gift_id": self.gift_available.pk})
        response = self.client.post(url, {"payment_type": "currency"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("detail", response.data)
        self.gift_available.refresh_from_db()
        self.assertEqual(self.gift_available.quantity, 3)

    def test_get_gift_insufficient_spins(self):
        self.profile.total_spins = 5
        self.profile.save()
        self.client.force_authenticate(user=self.user)
        url = reverse("gift_buy", kwargs={"gift_id": self.gift_need_more_spins.pk})
        response = self.client.post(url, {"payment_type": "spins"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("detail", response.data)

    def test_buy_inactive_gift(self):
        self.gift_available.is_active = False
        self.gift_available.save()
        self.client.force_authenticate(user=self.user)
        url = reverse("gift_buy", kwargs={"gift_id": self.gift_available.pk})
        response = self.client.post(url, {"payment_type": "currency"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_buy_out_of_stock_gift(self):
        self.gift_available.quantity = 0
        self.gift_available.save()
        self.client.force_authenticate(user=self.user)
        url = reverse("gift_buy", kwargs={"gift_id": self.gift_available.pk})
        response = self.client.post(url, {"payment_type": "currency"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.gift_available.refresh_from_db()
        self.assertFalse(self.gift_available.is_active)

    def test_buy_gift_not_found(self):
        self.client.force_authenticate(user=self.user)
        url = reverse("gift_buy", kwargs={"gift_id": "00000000-0000-0000-0000-000000000000"})
        response = self.client.post(url, {"payment_type": "currency"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
