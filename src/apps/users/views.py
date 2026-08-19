from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework.generics import RetrieveAPIView
from rest_framework.permissions import IsAuthenticated

from src.apps.users.models import User
from src.apps.users.serializers import UserProfileReadSerializer


class UserProfileView(RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserProfileReadSerializer

    def get_object(self):
        return User.objects.prefetch_related("slot_spins").get(pk=self.request.user.pk)

    @extend_schema(
        responses={
            200: OpenApiResponse(
                response=UserProfileReadSerializer,
                description="Профиль текущего пользователя с историей спинов.",
            )
        },
        description="Получить профиль текущего пользователя.",
        tags=["user"],
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)
