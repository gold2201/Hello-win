from rest_framework import serializers

from .models import Gift, GiftPurchase


class GiftReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Gift
        fields = (
            "id",
            "user",
            "name",
            "description",
            "price",
            "required_spins",
            "is_active",
            "quantity",
        )


class GiftPurchaseReadSerializer(serializers.ModelSerializer):
    gift_name = serializers.CharField(source="gift.name", read_only=True)

    class Meta:
        model = GiftPurchase
        fields = ("id", "gift", "gift_name", "payment_type", "created_at")


class GiftBuyRequestSerializer(serializers.Serializer):
    payment_type = serializers.ChoiceField(choices=["currency", "spins"])
