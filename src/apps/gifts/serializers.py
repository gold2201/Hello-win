from rest_framework import serializers

from .models import Gift, GiftPurchase


class GiftReadSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

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
            "image_url",
        )

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class GiftPurchaseReadSerializer(serializers.ModelSerializer):
    gift_name = serializers.CharField(source="gift.name", read_only=True)

    class Meta:
        model = GiftPurchase
        fields = ("id", "gift", "gift_name", "payment_type", "created_at")


class GiftBuyRequestSerializer(serializers.Serializer):
    payment_type = serializers.ChoiceField(choices=["currency", "spins"])
