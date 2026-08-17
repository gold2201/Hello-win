from django.urls import path

from src.apps.gifts.views import GiftBuyView, GiftListView

urlpatterns = [
    path("", GiftListView.as_view(), name="gift_list"),
    path("<uuid:gift_id>/buy/", GiftBuyView.as_view(), name="gift_buy"),
]
