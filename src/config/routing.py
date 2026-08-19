from django.urls import re_path

from src.apps.tasks.consumers import AdminNotificationsConsumer

websocket_urlpatterns = [
    re_path(r"^ws/notifications/$", AdminNotificationsConsumer.as_asgi()),
]
