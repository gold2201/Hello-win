from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer

from src.apps.users.models import User


class UserReadSerializer(serializers.ModelSerializer):
    balance = serializers.IntegerField(source="profile.balance", read_only=True)
    total_spins = serializers.IntegerField(source="profile.total_spins", read_only=True)

    class Meta:
        model = User
        fields = ("id", "username", "balance", "total_spins")


class RegisterWriteSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ("username", "password", "password_confirm")

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError({"password_confirm": "Пароли не совпадают"})
        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirm")
        user = User.objects.create_user(**validated_data)
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = UserReadSerializer(self.user).data
        return data


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField(
        required=True, help_text="Refresh-токен, который нужно отозвать"
    )


class RefreshSerializer(TokenRefreshSerializer):
    refresh = serializers.CharField(required=True, help_text="Refresh-токен для обновления пары")
