from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ..users.models import User
from .serializers import SlotStateReadSerializer, SpinRequestSerializer, SpinResponseSerializer
from .services import process_spin


class SlotStateView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={
            200: OpenApiResponse(
                response=SlotStateReadSerializer,
                description="Текущее состояние игрока и доступные ставки.",
            )
        },
        description="Получить баланс, количество спинов и варианты ставок.",
        tags=["slot"],
    )
    def get(self, request):
        user = User.objects.prefetch_related("profile").get(pk=request.user.pk)
        serializer = SlotStateReadSerializer(user)
        return Response(serializer.data)


class SpinView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=SpinRequestSerializer,
        responses={
            200: OpenApiResponse(
                response=SpinResponseSerializer,
                description="Результат вращения.",
            ),
            400: OpenApiResponse(description="Ошибка (недостаточно монет или неверная ставка)"),
        },
        description="Запустить вращение слота с указанной ставкой.",
        tags=["slot"],
    )
    def post(self, request):
        serializer = SpinRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        bet = serializer.validated_data["bet"]

        try:
            result = process_spin(request.user, bet)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(result, status=status.HTTP_200_OK)
