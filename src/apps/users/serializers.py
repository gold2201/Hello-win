from rest_framework import serializers

from src.apps.slot.models import SlotSpin
from src.apps.users.models import User


class UserReadSerializer(serializers.ModelSerializer):
    balance = serializers.IntegerField(source="profile.balance", read_only=True)
    total_spins = serializers.IntegerField(source="profile.total_spins", read_only=True)

    class Meta:
        model = User
        fields = ("id", "username", "balance", "total_spins")


class SlotSpinReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = SlotSpin
        fields = ("id", "bet", "win_amount", "created_at")


class UserProfileReadSerializer(serializers.ModelSerializer):
    balance = serializers.IntegerField(source="profile.balance", read_only=True)
    total_spins = serializers.IntegerField(source="profile.total_spins", read_only=True)
    spin_history = SlotSpinReadSerializer(source="slot_spins", many=True, read_only=True)

    class Meta:
        model = User
        fields = ("id", "username", "balance", "total_spins", "spin_history")
