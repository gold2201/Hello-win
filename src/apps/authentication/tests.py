from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from src.apps.users.models import PlayerProfile, User


class RegisterViewTests(APITestCase):
    def setUp(self):
        self.url = reverse("register")
        self.valid_data = {
            "username": "testuser",
            "password": "StrongPass123",
            "password_confirm": "StrongPass123",
        }

    def test_register_success(self):
        response = self.client.post(self.url, self.valid_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertIn("user", response.data)
        self.assertEqual(response.data["user"]["username"], "testuser")
        self.assertEqual(response.data["user"]["balance"], 100)
        self.assertEqual(response.data["user"]["total_spins"], 0)

        user = User.objects.get(username="testuser")
        self.assertTrue(PlayerProfile.objects.filter(user=user).exists())
        self.assertEqual(user.profile.balance, 100)

    def test_register_password_mismatch(self):
        data = self.valid_data.copy()
        data["password_confirm"] = "DifferentPass123"
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password_confirm", response.data)

    def test_register_missing_username(self):
        data = self.valid_data.copy()
        data.pop("username")
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("username", response.data)


class LoginViewTests(APITestCase):
    def setUp(self):
        self.url = reverse("login")
        self.username = "loginuser"
        self.password = "StrongPass123"
        self.user = User.objects.create_user(username=self.username, password=self.password)

    def test_login_success(self):
        response = self.client.post(
            self.url,
            {
                "username": self.username,
                "password": self.password,
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertIn("user", response.data)
        self.assertEqual(response.data["user"]["username"], self.username)

    def test_login_wrong_password(self):
        response = self.client.post(
            self.url,
            {
                "username": self.username,
                "password": "WrongPass123",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class LogoutViewTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="logoutuser", password="StrongPass123")

        login_response = self.client.post(
            reverse("login"),
            {
                "username": "logoutuser",
                "password": "StrongPass123",
            },
            format="json",
        )
        self.access = login_response.data["access"]
        self.refresh = login_response.data["refresh"]
        self.url = reverse("logout")

    def test_logout_success(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access}")
        response = self.client.post(self.url, {"refresh": self.refresh}, format="json")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        refresh_response = self.client.post(
            reverse("token_refresh"), {"refresh": self.refresh}, format="json"
        )
        self.assertIn(
            refresh_response.status_code,
            [status.HTTP_401_UNAUTHORIZED, status.HTTP_400_BAD_REQUEST],
        )

    def test_logout_missing_refresh(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access}")
        response = self.client.post(self.url, {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("detail", response.data)

    def test_logout_unauthenticated(self):
        response = self.client.post(self.url, {"refresh": self.refresh}, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class RefreshViewTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="refreshuser", password="StrongPass123")
        login_response = self.client.post(
            reverse("login"),
            {
                "username": "refreshuser",
                "password": "StrongPass123",
            },
            format="json",
        )
        self.refresh = login_response.data["refresh"]
        self.access = login_response.data["access"]
        self.url = reverse("token_refresh")

    def test_refresh_success(self):
        response = self.client.post(self.url, {"refresh": self.refresh}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

        old_refresh = self.refresh
        second_response = self.client.post(self.url, {"refresh": old_refresh}, format="json")
        self.assertIn(
            second_response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_400_BAD_REQUEST]
        )

    def test_refresh_invalid_token(self):
        response = self.client.post(self.url, {"refresh": "invalidtoken"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
