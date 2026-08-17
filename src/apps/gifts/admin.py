from django.contrib import admin

from .models import Gift, GiftPurchase


@admin.register(Gift)
class GiftAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "user",
        "price",
        "required_spins",
        "quantity",
        "is_active",
        "created_at",
    )
    list_filter = ("is_active", "required_spins", "user")
    search_fields = ("name", "description", "user__username")
    list_editable = (
        "price",
        "required_spins",
        "quantity",
        "is_active",
    )
    readonly_fields = ("created_at", "updated_at")


@admin.register(GiftPurchase)
class GiftPurchaseAdmin(admin.ModelAdmin):
    list_display = ("user", "gift", "payment_type", "created_at")
    list_filter = ("payment_type", "created_at")
    search_fields = ("user__username", "gift__name")
    readonly_fields = ("created_at", "updated_at")
