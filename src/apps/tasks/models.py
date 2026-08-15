from django.db import models

from src.apps.core.base_models import BaseModel
from src.apps.users.models import User


class Task(BaseModel):
    title = models.CharField(max_length=200, verbose_name="Название")
    description = models.TextField(verbose_name="Описание")
    reward = models.PositiveIntegerField(default=0, verbose_name="Награда (монеты)")

    class Meta:
        verbose_name = "Задание"
        verbose_name_plural = "Задания"

    def __str__(self):
        return self.title


class TaskRequest(BaseModel):
    STATUS_CHOICES = [
        ("pending", "Ожидает подтверждения"),
        ("approved", "Подтверждено"),
        ("rejected", "Отклонено"),
    ]
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="task_requests", verbose_name="Пользователь"
    )
    task = models.ForeignKey(
        Task, on_delete=models.CASCADE, related_name="requests", verbose_name="Задание"
    )
    status = models.CharField(
        max_length=10, choices=STATUS_CHOICES, default="pending", verbose_name="Статус"
    )
    processed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="processed_requests",
        verbose_name="Обработал администратор",
    )
    processed_at = models.DateTimeField(null=True, blank=True, verbose_name="Время обработки")

    class Meta:
        verbose_name = "Запрос на задание"
        verbose_name_plural = "Запросы на задания"

    def __str__(self):
        return f"{self.user.username} -> {self.task.title} [{self.status}]"
