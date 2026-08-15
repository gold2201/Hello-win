from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _

from .models import PlayerProfile, User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("username", "is_staff", "is_superuser", "is_active", "created_at")
    list_filter = ("is_staff", "is_superuser", "is_active")
    search_fields = ("username",)
    ordering = ("username",)
    fieldsets = (
        (None, {"fields": ("username", "password")}),
        (
            _("Permissions"),
            {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")},
        ),
        (_("Important dates"), {"fields": ("last_login", "created_at", "updated_at")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("username", "password1", "password2"),
            },
        ),
    )
    readonly_fields = ("created_at", "updated_at", "last_login")


@admin.register(PlayerProfile)
class PlayerProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "balance", "total_spins", "created_at")
    search_fields = ("user__username",)
    readonly_fields = ("created_at", "updated_at")
    ordering = ("user__username",)
