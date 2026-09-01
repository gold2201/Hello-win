from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from src.apps.gifts.models import Gift
from src.apps.gifts.serializers import GiftBuyRequestSerializer, GiftReadSerializer
from src.apps.gifts.services import purchase_gift


class GiftListView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={
            200: OpenApiResponse(
                response=GiftReadSerializer(many=True),
                description="Список доступных подарков.",
            )
        },
        description="Получить список всех подарков (только активные).",
        tags=["gifts"],
    )
    def get(self, request):
        gifts = Gift.objects.filter(user=request.user)
        serializer = GiftReadSerializer(gifts, many=True, context={"request": request})
        return Response(serializer.data)


class GiftBuyView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=GiftBuyRequestSerializer,
        responses={
            200: OpenApiResponse(description="Покупка успешна."),
            400: OpenApiResponse(
                description="Ошибка (недостаточно монет/спинов, подарок недоступен)"
            ),
        },
        description="Купить подарок за монеты или получить за спины.",
        tags=["gifts"],
    )
    def post(self, request, gift_id):
        serializer = GiftBuyRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payment_type = serializer.validated_data["payment_type"]

        try:
            gift = Gift.objects.get(pk=gift_id)
            result = purchase_gift(request.user, gift, payment_type)
        except Gift.DoesNotExist:
            return Response({"detail": "Подарок не найден"}, status=status.HTTP_404_NOT_FOUND)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            {
                "detail": "Покупка успешна",
                "balance": result["balance"],
                "total_spins": result["total_spins"],
            },
            status=status.HTTP_200_OK,
        )
