import logging
from datetime import timedelta
from .models import Animal, HealthRecord

logger = logging.getLogger(__name__)


# Default intervals in days per record type
HEALTH_INTERVALS = {
    HealthRecord.RecordType.VACCINATION: 365,  # yearly
    HealthRecord.RecordType.DEWORMING:   90,   # every 3 months
    HealthRecord.RecordType.TREATMENT:   None, # no auto-repeat
    HealthRecord.RecordType.CHECKUP:     180,  # every 6 months
}


class HealthService:

    @staticmethod
    def log_health_record(
        animal: Animal,
        record_type: str,
        date_given,
        product_used='',
        administered_by='',
        next_due_date=None,
        notes=''
    ) -> HealthRecord:
        """
        Single entry point for logging a health record.
        1. Calculates next_due_date if not provided
        2. Creates HealthRecord
        3. Creates Notification reminder
        """
        # 1. Auto-calculate next_due_date if not manually set
        if not next_due_date:
            interval = HEALTH_INTERVALS.get(record_type)
            if interval:
                next_due_date = date_given + timedelta(days=interval)

        # 2. Create health record
        record = HealthRecord.objects.create(
            animal          = animal,
            record_type     = record_type,
            product_used    = product_used,
            date_given      = date_given,
            next_due_date   = next_due_date,
            administered_by = administered_by,
            notes           = notes,
        )

        # 3. Create notification if next due date exists
        if next_due_date:
            from notifications.services import NotificationService
            NotificationService.create_health_reminder(record)

        logger.info(
            f"Health record logged: {record_type} for "
            f"{animal.animal_tag} on {date_given} — "
            f"next due: {next_due_date}"
        )

        return record