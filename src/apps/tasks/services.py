from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.db import transaction
from django.utils import timezone

from .models import Task, TaskRequest
from .serializers import TaskRequestReadSerializer


@transaction.atomic
def submit_task_request(user, task_id) -> TaskRequest:
    task = Task.objects.get(pk=task_id)
    task_request = TaskRequest.objects.create(user=user, task=task)

    channel_layer = get_channel_layer()
    data = TaskRequestReadSerializer(task_request).data
    async_to_sync(channel_layer.group_send)(
        "admin_notifications",
        {
            "type": "new_task_request",
            "data": data,
        },
    )
    return task_request


@transaction.atomic
def process_task_request(task_request: TaskRequest, admin, action: str) -> TaskRequest:
    if task_request.status != "pending":
        raise ValueError("Запрос уже обработан")

    if action == "approve":
        task_request.status = "approved"
        task_request.processed_by = admin
        task_request.processed_at = timezone.now()
        task_request.save()

        profile = task_request.user.profile
        profile.balance += task_request.task.reward
        profile.save()
    elif action == "reject":
        task_request.status = "rejected"
        task_request.processed_by = admin
        task_request.processed_at = timezone.now()
        task_request.save()
    else:
        raise ValueError("Неверное действие")

    return task_request
