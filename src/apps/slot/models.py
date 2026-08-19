from django.db import models

from src.apps.core.base_models import BaseModel
from src.apps.users.models import User


class SlotSpin(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="slot_spins")
    bet = models.PositiveIntegerField()
    win_amount = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name = "Вращение слота"
        verbose_name_plural = "Вращения слота"

    def __str__(self):
        return f"{self.user.username} - {self.created_at} - {self.win_amount}"
