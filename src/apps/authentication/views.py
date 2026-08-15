from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .serializers import (
    CustomTokenObtainPairSerializer,
    LogoutSerializer,
    RefreshSerializer,
    RegisterWriteSerializer,
    UserReadSerializer,
)


class RegisterView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        request=RegisterWriteSerializer,
        responses={
            201: OpenApiResponse(
                response=UserReadSerializer,
                description="Успешная регистрация.",
            ),
            400: OpenApiResponse(description="Ошибка валидации"),
        },
        description="Регистрация нового пользователя. Создаёт профиль с балансом 100 монет.",
        tags=["auth"],
    )
    def post(self, request):
        serializer = RegisterWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user": UserReadSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    @extend_schema(
        request=CustomTokenObtainPairSerializer,
        responses={
            200: OpenApiResponse(
                description="Успешный вход. Возвращает access/refresh токены и данные пользователя."
            ),
            401: OpenApiResponse(description="Неверные учётные данные"),
        },
        description="Аутентификация пользователя.",
        tags=["auth"],
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=LogoutSerializer,
        responses={
            204: OpenApiResponse(description="Токен успешно отозван (blacklist)"),
            400: OpenApiResponse(description="Неверный или отсутствующий refresh-токен"),
            401: OpenApiResponse(description="Не аутентифицирован"),
        },
        description="Выход пользователя. Отзывает refresh-токен (добавляет в blacklist).",
        tags=["auth"],
    )
    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response({"detail": "Refresh token обязателен"}, status=400)
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=204)
        except Exception:
            return Response({"detail": "Неверный refresh token"}, status=400)


class RefreshView(TokenRefreshView):
    @extend_schema(
        request=RefreshSerializer,
        responses={
            200: OpenApiResponse(
                description="Новая пара access/refresh токенов (старый refresh заблокирован)"
            ),
            401: OpenApiResponse(description="Неверный или просроченный refresh-токен"),
        },
        description="Обновление access-токена по refresh.",
        tags=["auth"],
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)
