from django.contrib.auth.base_user import AbstractBaseUser
from django.contrib.auth.models import PermissionsMixin
from django.db import models

from ..core.base_models import BaseModel
from .managers import UserManager


class User(AbstractBaseUser, PermissionsMixin, BaseModel):
    username = models.CharField(max_length=150, unique=True, verbose_name="Никнейм")

    is_active = models.BooleanField(default=True, verbose_name="Активен")
    is_staff = models.BooleanField(
        default=False,
        verbose_name="Статус персонала",
        help_text="Определяет, может ли пользователь войти в админку.",
    )

    objects = UserManager()

    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = []

    class Meta:
        verbose_name = "Пользователь"
        verbose_name_plural = "Пользователи"

    def __str__(self):
        return self.username


class PlayerProfile(BaseModel):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="profile", verbose_name="Пользователь"
    )
    balance = models.PositiveIntegerField(default=0, verbose_name="Баланс (монеты)")
    total_spins = models.PositiveIntegerField(default=0, verbose_name="Всего спинов")

    class Meta:
        verbose_name = "Профиль игрока"
        verbose_name_plural = "Профили игроков"

    def __str__(self):
        return f"Профиль {self.user.username}"
