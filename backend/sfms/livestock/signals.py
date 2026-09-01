import logging
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import HealthRecord

logger = logging.getLogger(__name__)


@receiver(post_save, sender=HealthRecord)
def on_health_record_saved(sender, instance, created, **kwargs):
    """
    Safety net signal — fires on ANY HealthRecord save.
    Primary path is HealthService.log_health_record() from views.
    This catches direct saves that bypass the service
    e.g. Django admin, data imports, management commands.
    """
    if not created:
        return

    logger.info(
        f"[Signal] HealthRecord saved for {instance.animal.animal_tag} "
        f"— {instance.record_type} on {instance.date_given}"
    )