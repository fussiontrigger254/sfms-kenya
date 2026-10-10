import logging
from datetime import timedelta
import re

from .models import Notification


logger = logging.getLogger(__name__)

FIREBASE_UID_PATTERN = re.compile(r"^[A-Za-z0-9_-]{20,}$")


def greeting(user):
    """Return a neutral greeting without exposing Firebase identifiers."""
    first = (user.first_name or "").strip()

    if not first or FIREBASE_UID_PATTERN.fullmatch(first):
        return "Habari"

    return f"Habari {first}"


class NotificationService:

    @staticmethod
    def create_spray_reminder(crop) -> Notification:
        """Create a pending reminder two days before the next spray date."""
        if not crop.next_spray_date:
            return None

        farm = crop.farm
        farmer = farm.user
        remind_on = crop.next_spray_date - timedelta(days=2)

        notification = Notification.objects.create(
            user=farmer,
            message=(
                f"{greeting(farmer)}, your farm \"{farm.farm_name}\"'s "
                f"{crop.crop_name} spray is due on "
                f"{crop.next_spray_date.strftime('%a %d %b')}. "
                "Check weather before spraying."
            ),
            type=Notification.Type.SPRAY_REMINDER,
            channel=Notification.Channel.SMS,
            due_date=remind_on,
            status=Notification.Status.PENDING,
        )

        from notifications.tasks import send_notification_task
        try:
            send_notification_task.delay(str(notification.id))
        except Exception:
            logger.exception("Could not queue notification %s", notification.id)

        return notification

    @staticmethod
    def create_health_reminder(health_record) -> Notification:
        """Create a pending reminder three days before health is due."""
        if not health_record.next_due_date:
            return None

        animal = health_record.animal
        farm = animal.farm
        farmer = farm.user
        remind_on = health_record.next_due_date - timedelta(days=3)

        notification = Notification.objects.create(
            user=farmer,
            message=(
                f"{greeting(farmer)}, your farm \"{farm.farm_name}\"'s "
                f"{animal.animal_tag} ({animal.breed or animal.animal_type}) "
                f"{health_record.record_type} is due on "
                f"{health_record.next_due_date.strftime('%a %d %b')}. "
                "Contact your vet if needed."
            ),
            type=Notification.Type.HEALTH_DUE,
            channel=Notification.Channel.SMS,
            due_date=remind_on,
            status=Notification.Status.PENDING,
        )

        from notifications.tasks import send_notification_task
        try:
            send_notification_task.delay(str(notification.id))
        except Exception:
            logger.exception("Could not queue notification %s", notification.id)

        return notification
