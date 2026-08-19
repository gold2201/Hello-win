from django.urls import path

from src.apps.slot.views import SlotStateView, SpinView

urlpatterns = [
    path("state/", SlotStateView.as_view(), name="slot_state"),
    path("spin/", SpinView.as_view(), name="slot_spin"),
]
