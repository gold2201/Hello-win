from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import PlayerProfile, User


@receiver(post_save, sender=User)
def create_player_profile(sender, instance, created, **kwargs):
    if created:
        PlayerProfile.objects.create(user=instance, balance=100)
