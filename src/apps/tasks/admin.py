from django.contrib import admin
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from .models import Task, TaskRequest


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ("title", "reward", "created_at", "updated_at")
    search_fields = ("title", "description")
    list_editable = ("reward",)
    readonly_fields = ("created_at", "updated_at")


@admin.register(TaskRequest)
class TaskRequestAdmin(admin.ModelAdmin):
    list_display = ("user", "task", "status", "processed_by", "created_at", "processed_at")
    list_filter = ("status", "created_at")
    search_fields = ("user__username", "task__title")
    readonly_fields = (
        "user",
        "task",
        "status",
        "processed_by",
        "processed_at",
        "created_at",
        "updated_at",
    )
    ordering = ("-created_at",)
    actions = ["approve_requests", "reject_requests"]

    @admin.action(description="Одобрить выбранные запросы")
    def approve_requests(self, request, queryset):
        for task_request in queryset.filter(status="pending"):
            task_request.status = "approved"
            task_request.processed_by = request.user
            task_request.processed_at = timezone.now()
            task_request.save()
            profile = task_request.user.profile
            profile.balance += task_request.task.reward
            profile.save()
        self.message_user(request, _("Выбранные запросы одобрены."))

    @admin.action(description="Отклонить выбранные запросы")
    def reject_requests(self, request, queryset):
        for task_request in queryset.filter(status="pending"):
            task_request.status = "rejected"
            task_request.processed_by = request.user
            task_request.processed_at = timezone.now()
            task_request.save()
        self.message_user(request, _("Выбранные запросы отклонены."))
