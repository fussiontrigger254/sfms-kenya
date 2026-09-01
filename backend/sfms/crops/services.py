# backend/sfms/crops/services.py

import logging
from datetime import timedelta
from .models import Crop, SprayLog

logger = logging.getLogger(__name__)


class SprayService:

    @staticmethod
    def log_spray(crop: Crop, spray_date, product_used='', notes='') -> SprayLog:
        """
        Single entry point for logging a spray event.
        1. Creates SprayLog record
        2. Updates Crop.last_spray_date
        3. Recalculates Crop.next_spray_date
        4. Triggers notification creation
        """
        # 1. Create spray record
        spray_log = SprayLog.objects.create(
            crop         = crop,
            spray_date   = spray_date,
            product_used = product_used,
            notes        = notes,
        )

        # 2 & 3. Update crop dates
        SprayService.sync_crop_dates(spray_log)

        # 4. Create notification
        from notifications.services import NotificationService
        NotificationService.create_spray_reminder(crop)

        logger.info(f"Spray logged for {crop.crop_name} on {spray_date}")

        return spray_log

    @staticmethod
    def sync_crop_dates(spray_log: SprayLog):
        """
        Updates Crop.last_spray_date and recalculates next_spray_date.
        Called by SprayService.log_spray() AND by signal as safety net.
        """
        crop = spray_log.crop

        # Only update if this spray is more recent than what's recorded
        if not crop.last_spray_date or spray_log.spray_date >= crop.last_spray_date:
            crop.last_spray_date = spray_log.spray_date
            crop.recalculate_next_spray()
            crop.save(update_fields=['last_spray_date', 'next_spray_date'])

            logger.info(
                f"Crop {crop.crop_name} → "
                f"last spray: {crop.last_spray_date} | "
                f"next spray: {crop.next_spray_date}"
            )