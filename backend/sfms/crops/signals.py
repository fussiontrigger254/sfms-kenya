import logging
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import SprayLog

logger = logging.getLogger(__name__)


@receiver(post_save, sender=SprayLog)
def on_spray_logged(sender, instance, created, **kwargs):
    """
    Safety net signal — fires on ANY SprayLog save.
    Primary path is SprayService.log_spray() from views.
    This catches direct saves that bypass the service
    e.g. Django admin, data imports, management commands.
    """
    if not created:
        return  # only fire on new records, not edits

    from .services import SprayService
    SprayService.sync_crop_dates(instance)

    logger.info(
        f"[Signal] SprayLog saved for {instance.crop.crop_name} "
        f"on {instance.spray_date} — crop dates synced."
    )