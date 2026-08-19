from django.db import transaction

from src.apps.gifts.models import Gift, GiftPurchase
from src.apps.users.models import PlayerProfile


@transaction.atomic
def purchase_gift(user, gift: Gift, payment_type: str) -> dict:
    """
    Покупка подарка за монеты или за спины.
    """
    profile = PlayerProfile.objects.select_for_update().get(user=user)
    gift = Gift.objects.select_for_update().get(pk=gift.pk)

    if not gift.is_active:
        raise ValueError("Подарок недоступен")

    if gift.quantity <= 0:
        gift.is_active = False
        gift.save(update_fields=["is_active"])
        raise ValueError("Подарок закончился")

    if payment_type == "currency":
        if profile.balance < gift.price:
            raise ValueError("Недостаточно монет")
        profile.balance -= gift.price
    elif payment_type == "spins":
        if profile.total_spins < gift.required_spins:
            raise ValueError("Недостаточно спинов")
        pass
    else:
        raise ValueError("Неверный тип оплаты")

    gift.quantity -= 1
    if gift.quantity <= 0:
        gift.is_active = False
    gift.save(update_fields=["quantity", "is_active"])

    profile.save()

    purchase = GiftPurchase.objects.create(
        user=user,
        gift=gift,
        payment_type=payment_type,
    )

    return {
        "purchase": purchase,
        "balance": profile.balance,
        "total_spins": profile.total_spins,
    }
