from django.urls import path

from src.apps.tasks.views import (
    AdminTaskRequestListView,
    AdminTaskRequestProcessView,
    TaskListView,
    TaskRequestCreateView,
    UserTaskRequestListView,
)

urlpatterns = [
    path("", TaskListView.as_view(), name="task_list"),
    path("request/", TaskRequestCreateView.as_view(), name="task_request_create"),
    path("requests/", AdminTaskRequestListView.as_view(), name="admin_task_request_list"),
    path(
        "requests/<uuid:request_id>/process/",
        AdminTaskRequestProcessView.as_view(),
        name="admin_task_request_process",
    ),
    path("my-requests/", UserTaskRequestListView.as_view(), name="user_task_request_list"),
]
