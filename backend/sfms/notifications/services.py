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

        from notifications.tasks import send_notification_task
        send_notification_task.delay(str(notification.id))

        return notification

    @staticmethod
    def create_health_reminder(health_record) -> Notification:
        """
        Creates a pending SMS notification 3 days before next health due date.
        Called by HealthService after every health record log.
        """
        if not health_record.next_due_date:
            return None

        animal    = health_record.animal
        farmer    = animal.farm.user
        remind_on = health_record.next_due_date - timedelta(days=3)

        notification = Notification.objects.create(
            user    = farmer,
            message = (
                f"Ndugu {farmer.get_full_name() or farmer.username}, "
                f"{animal.animal_tag} ({animal.breed or animal.animal_type}) "
                f"{health_record.record_type} due on "
                f"{health_record.next_due_date.strftime('%a %d %b')}. "
                f"Contact your vet if needed."
            ),
            type     = Notification.Type.HEALTH_DUE,
            channel  = Notification.Channel.SMS,
            due_date = remind_on,
            status   = Notification.Status.PENDING,
        )

        from notifications.tasks import send_notification_task
        send_notification_task.delay(str(notification.id))

        return notification