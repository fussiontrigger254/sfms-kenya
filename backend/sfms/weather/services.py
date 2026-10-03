# backend/sfms/weather/services.py
import os

import requests


class GeocodingError(Exception):
    """Base error for location geocoding failures."""


class GeocodingConfigurationError(GeocodingError):
    """The geocoding service is not configured correctly."""


class GeocodingUnavailableError(GeocodingError):
    """The geocoding provider could not be reached or returned an error."""


class LocationNotFoundError(GeocodingError):
    """The provider did not find the submitted location."""


class WeatherService:
    BASE_URL = "https://api.openweathermap.org/data/2.5/forecast"

    @staticmethod
    def get_forecast(latitude, longitude):
        api_key = os.environ.get("OPENWEATHER_API_KEY")
        if not api_key:
            raise ValueError("OPENWEATHER_API_KEY is not set")

        params = {
            "lat": latitude,
            "lon": longitude,
            "appid": api_key,
            "units": "metric",
        }

        response = requests.get(WeatherService.BASE_URL, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()

        daily = {}
        for entry in data.get("list", []):
            date_str = entry["dt_txt"].split(" ")[0]
            rain_mm = entry.get("rain", {}).get("3h", 0)
            temp = entry["main"]["temp"]
            condition = entry["weather"][0]["main"]

            if date_str not in daily:
                daily[date_str] = {
                    "date": date_str,
                    "temps": [],
                    "rain_mm": 0,
                    "conditions": [],
                }

            daily[date_str]["temps"].append(temp)
            daily[date_str]["rain_mm"] += rain_mm
            daily[date_str]["conditions"].append(condition)

        forecast = []
        for date_str, values in sorted(daily.items())[:5]:
            forecast.append({
                "date": date_str,
                "temp_min": round(min(values["temps"]), 1),
                "temp_max": round(max(values["temps"]), 1),
                "rain_mm": round(values["rain_mm"], 1),
                "condition": max(set(values["conditions"]), key=values["conditions"].count),
                "rain_expected": values["rain_mm"] > 1.0,
            })

        return forecast

    @staticmethod
    def check_spray_conflict(forecast, spray_date_str):
        for day in forecast:
            if day["date"] == spray_date_str:
                return day["rain_expected"]
        return False


class GeocodingService:
    BASE_URL = "https://api.openweathermap.org/geo/1.0/direct"

    @staticmethod
    def geocode(location_query):
        if not location_query or not location_query.strip():
            raise LocationNotFoundError("Enter a location to search.")

        api_key = os.environ.get("OPENWEATHER_API_KEY")
        if not api_key:
            raise GeocodingConfigurationError(
                "Location lookup is not configured."
            )

        query = location_query.strip()
        if "kenya" not in query.lower():
            query = f"{query}, Kenya"

        try:
            response = requests.get(
                GeocodingService.BASE_URL,
                params={
                    "q": query,
                    "limit": 1,
                    "appid": api_key,
                },
                timeout=10,
            )
        except requests.RequestException as exc:
            raise GeocodingUnavailableError(
                "Location service is temporarily unavailable."
            ) from exc

        if response.status_code in (401, 403):
            raise GeocodingConfigurationError(
                "Location lookup is unavailable because the OpenWeather API key is invalid."
            )

        if response.status_code == 404 or response.status_code >= 500:
            raise GeocodingUnavailableError(
                "Location service is temporarily unavailable."
            )

        try:
            response.raise_for_status()
            results = response.json()
        except (requests.RequestException, ValueError) as exc:
            raise GeocodingUnavailableError(
                "Location service returned an invalid response."
            ) from exc

        if not results:
            raise LocationNotFoundError(
                "Location not found. Try adding a nearby town or county."
            )

        return results[0]["lat"], results[0]["lon"]
