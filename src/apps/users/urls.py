from django.urls import path

from src.apps.users.views import UserProfileView

urlpatterns = [
    path("profile/", UserProfileView.as_view(), name="user_profile"),
]
