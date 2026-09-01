from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Task, TaskRequest
from .serializers import (
    TaskReadSerializer,
    TaskRequestActionSerializer,
    TaskRequestCreateSerializer,
    TaskRequestReadSerializer,
)
from .services import process_task_request, submit_task_request


class TaskListView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={
            200: OpenApiResponse(
                response=TaskReadSerializer(many=True), description="Список заданий"
            )
        },
        description="Получить список доступных заданий.",
        tags=["tasks"],
    )
    def get(self, request):
        tasks = Task.objects.all()
        serializer = TaskReadSerializer(tasks, many=True)
        return Response(serializer.data)


class UserTaskRequestListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_requests = TaskRequest.objects.filter(user=request.user)
        serializer = TaskRequestReadSerializer(user_requests, many=True)
        return Response(serializer.data)


class TaskRequestCreateView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=TaskRequestCreateSerializer,
        responses={
            201: OpenApiResponse(response=TaskRequestReadSerializer, description="Запрос создан"),
            400: OpenApiResponse(description="Ошибка (задание не найдено)"),
        },
        description="Создать запрос на выполнение задания.",
        tags=["tasks"],
    )
    def post(self, request):
        serializer = TaskRequestCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        task_id = serializer.validated_data["task_id"]

        try:
            task_request = submit_task_request(request.user, task_id)
        except Task.DoesNotExist:
            return Response({"detail": "Задание не найдено"}, status=status.HTTP_404_NOT_FOUND)

        return Response(
            TaskRequestReadSerializer(task_request).data, status=status.HTTP_201_CREATED
        )


class AdminTaskRequestListView(APIView):
    permission_classes = [IsAdminUser]

    @extend_schema(
        responses={
            200: OpenApiResponse(
                response=TaskRequestReadSerializer(many=True), description="Список запросов"
            )
        },
        description="Получить список запросов (для администратора).",
        tags=["tasks"],
    )
    def get(self, request):
        status_filter = request.query_params.get("status")
        queryset = TaskRequest.objects.all()
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        serializer = TaskRequestReadSerializer(queryset, many=True)
        return Response(serializer.data)


class AdminTaskRequestProcessView(APIView):
    permission_classes = [IsAdminUser]

    @extend_schema(
        request=TaskRequestActionSerializer,
        responses={
            200: OpenApiResponse(
                response=TaskRequestReadSerializer, description="Запрос обработан"
            ),
            400: OpenApiResponse(description="Ошибка"),
        },
        description="Одобрить или отклонить запрос задания.",
        tags=["tasks"],
    )
    def post(self, request, request_id):
        serializer = TaskRequestActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        action = serializer.validated_data["action"]

        try:
            task_request = TaskRequest.objects.get(pk=request_id)
            task_request = process_task_request(task_request, request.user, action)
        except TaskRequest.DoesNotExist:
            return Response({"detail": "Запрос не найден"}, status=status.HTTP_404_NOT_FOUND)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(TaskRequestReadSerializer(task_request).data, status=status.HTTP_200_OK)
