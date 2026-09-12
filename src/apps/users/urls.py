from django.urls import path

from src.apps.users.views import MiniGameRewardView, UserProfileView

urlpatterns = [
    path("profile/", UserProfileView.as_view(), name="user_profile"),
    path("minigame-reward/", MiniGameRewardView.as_view(), name="minigame_reward"),
]
