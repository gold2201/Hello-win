from rest_framework import serializers

from src.apps.users.models import User


class SlotStateReadSerializer(serializers.ModelSerializer):
    balance = serializers.IntegerField(source="profile.balance", read_only=True)
    total_spins = serializers.IntegerField(source="profile.total_spins", read_only=True)
    bet_options = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("username", "balance", "total_spins", "bet_options")

    def get_bet_options(self, obj):
        return [5, 10, 25, 50, 100]


class SpinRequestSerializer(serializers.Serializer):
    bet = serializers.ChoiceField(choices=[5, 10, 25, 50, 100])


class SpinResponseSerializer(serializers.Serializer):
    matrix = serializers.ListField(child=serializers.ListField(child=serializers.CharField()))
    win_amount = serializers.IntegerField()
    total_win_multiplier = serializers.DecimalField(max_digits=5, decimal_places=2)
    balance = serializers.IntegerField()
    total_spins = serializers.IntegerField()
    combinations = serializers.ListField(child=serializers.DictField())
