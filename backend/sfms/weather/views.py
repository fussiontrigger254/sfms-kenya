from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from farms.models import Farm
from .services import WeatherService


class FarmWeatherView(APIView):
    """Return the forecast and spray conflicts for one owned farm."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, farm_id):
        try:
            farm = Farm.objects.get(id=farm_id, user=request.user)
        except Farm.DoesNotExist:
            return Response(
                {"detail": "Farm not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if farm.latitude is None or farm.longitude is None:
            return Response(
                {"detail": "This farm has no latitude/longitude set."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            forecast = WeatherService.get_forecast(
                farm.latitude,
                farm.longitude,
            )
        except Exception as exc:
            return Response(
                {"detail": f"Could not fetch weather: {exc}"},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        conflicts = []
        for crop in farm.crops.all():
            if crop.next_spray_date:
                spray_date = crop.next_spray_date.strftime("%Y-%m-%d")
                if WeatherService.check_spray_conflict(forecast, spray_date):
                    conflicts.append(
                        {
                            "crop_name": crop.crop_name,
                            "next_spray_date": spray_date,
                        }
                    )

        return Response(
            {
                "farm_name": farm.farm_name,
                "forecast": forecast,
                "spray_conflicts": conflicts,
            }
        )
