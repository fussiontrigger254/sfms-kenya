from datetime import timedelta
from .models import Notification


class NotificationService:

    @staticmethod
    def create_spray_reminder(crop) -> Notification:
        """
        Creates a pending SMS notification 2 days before next spray date.
        Called by SprayService after every spray log.
        """
        if not crop.next_spray_date:
            return None

        farmer    = crop.farm.user
        remind_on = crop.next_spray_date - timedelta(days=2)

        notification = Notification.objects.create(
            user    = farmer,
            message = (
                f"Ndugu {farmer.get_full_name() or farmer.username}, "
                f"{crop.crop_name} spray due on "
                f"{crop.next_spray_date.strftime('%a %d %b')}. "
                f"Check weather before spraying."
            ),
            type     = Notification.Type.SPRAY_REMINDER,
            channel  = Notification.Channel.SMS,
            due_date = remind_on,
            status   = Notification.Status.PENDING,
        )

        # Queue for async sending — Celery task (stubbed until Week 4)
        from notifications.tasks import send_notification_task
        send_notification_task.delay(str(notification.id))

        return notification