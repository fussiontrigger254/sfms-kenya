import logging
from celery import shared_task

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def send_notification_task(self, notification_id: str):

    try:
        from .models import Notification
        notification = Notification.objects.get(id=notification_id)

        if notification.channel == Notification.Channel.SMS:
            _send_sms(notification)
        elif notification.channel == Notification.Channel.EMAIL:
            _send_email(notification)

        notification.status = Notification.Status.SENT
        notification.save(update_fields=['status'])

        logger.info(f"Notification {notification_id} sent successfully.")

    except Exception as exc:
        logger.error(f"Notification {notification_id} failed: {exc}")
        raise self.retry(exc=exc, countdown=60)


def _send_sms(notification):
    # ── Week 4: Africa's Talking integration goes here ──
    logger.info(
        f"[SMS STUB] → {notification.user.username} | {notification.message}"
    )


def _send_email(notification):
    # ── Phase 2: SendGrid / Mailgun goes here ──
    pass