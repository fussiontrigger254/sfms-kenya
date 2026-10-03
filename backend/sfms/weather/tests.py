from unittest.mock import Mock, patch
from django.test import SimpleTestCase
from .services import GeocodingService, LocationNotFoundError


class WeatherServiceTests(SimpleTestCase):
    @patch.dict('os.environ', {'OPENWEATHER_API_KEY': 'test-key'})
    @patch('weather.services.requests.get')
    def test_geocoding_returns_coordinates(self, get):
        response = Mock(status_code=200)
        response.json.return_value = [{'lat': -0.3, 'lon': 36.1}]
        get.return_value = response
        self.assertEqual(GeocodingService.geocode('Nakuru'), (-0.3, 36.1))

    @patch.dict('os.environ', {'OPENWEATHER_API_KEY': 'test-key'})
    @patch('weather.services.requests.get')
    def test_geocoding_reports_unknown_location(self, get):
        response = Mock(status_code=200)
        response.json.return_value = []
        get.return_value = response
        with self.assertRaises(LocationNotFoundError):
            GeocodingService.geocode('Unknown place')
