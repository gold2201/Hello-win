from rest_framework import serializers

from .models import Task, TaskRequest


class TaskReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ("id", "title", "description", "reward")


class TaskRequestCreateSerializer(serializers.Serializer):
    task_id = serializers.UUIDField()


class TaskRequestReadSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source="user.username", read_only=True)
    task_title = serializers.CharField(source="task.title", read_only=True)
    task_reward = serializers.IntegerField(source="task.reward", read_only=True)

    class Meta:
        model = TaskRequest
        fields = (
            "id",
            "user",
            "task",
            "task_title",
            "task_reward",
            "status",
            "created_at",
            "processed_by",
            "processed_at",
        )


class TaskRequestActionSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=["approve", "reject"])
