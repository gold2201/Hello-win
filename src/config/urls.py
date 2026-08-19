from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("apps.authentication.urls")),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/slot/", include("apps.slot.urls")),
    path("api/user/", include("apps.users.urls")),
    path("api/gifts/", include("apps.gifts.urls")),
    path("api/tasks/", include("apps.tasks.urls")),
]
