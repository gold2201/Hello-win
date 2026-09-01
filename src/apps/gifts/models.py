from django.db import models

from src.apps.core.base_models import BaseActiveModel, BaseModel
from src.apps.users.models import User


class Gift(BaseActiveModel):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="gifts",
        verbose_name="Владелец",
    )
    name = models.CharField(max_length=200, verbose_name="Название")
    description = models.TextField(blank=True, verbose_name="Описание")
    price = models.PositiveIntegerField(default=0, verbose_name="Цена в монетах")
    required_spins = models.PositiveIntegerField(
        default=0, verbose_name="Необходимо спинов для бесплатного получения"
    )
    quantity = models.PositiveIntegerField(default=0, verbose_name="Количество доступных")

    image = models.ImageField(
        upload_to="gifts/",
        null=True,
        blank=True,
        verbose_name="Картинка подарка",
    )

    class Meta:
        verbose_name = "Подарок"
        verbose_name_plural = "Подарки"

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if self.quantity <= 0:
            self.is_active = False
        super().save(*args, **kwargs)


class GiftPurchase(BaseModel):
    PAYMENT_TYPE_CHOICES = [
        ("currency", "За монеты"),
        ("spins", "За спины"),
    ]
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="gift_purchases", verbose_name="Пользователь"
    )
    gift = models.ForeignKey(
        Gift, on_delete=models.CASCADE, related_name="purchases", verbose_name="Подарок"
    )
    payment_type = models.CharField(
        max_length=10, choices=PAYMENT_TYPE_CHOICES, verbose_name="Тип оплаты"
    )

    class Meta:
        verbose_name = "Покупка подарка"
        verbose_name_plural = "Покупки подарков"

    def __str__(self):
        return f"{self.user.username} -> {self.gift.name} ({self.payment_type})"
