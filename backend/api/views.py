import requests
from django.core.cache import cache
from django.conf import settings
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import generics, status
from .serializers import NoificationSerializers
from .models import Notification


class ListNotificationsView(generics.ListAPIView):
    serializer_class = NoificationSerializers
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Notification.objects.exclude(user=user)


class WeatherView(APIView):
    permission_classes = [AllowAny]  # Weather data can be public
    CACHE_KEY = 'weather_data'

    def get(self, request):
        # Try to get cached data first
        cached_data = cache.get(self.CACHE_KEY)
        if cached_data:
            return Response(cached_data)

        try:
            # If no cached data, fetch from OpenWeather API
            api_key = settings.WEATHER_API_KEY
            # Example coordinates for Sidi Khaled
            lon = 4.983333
            lat = 34.383333
            
            response = requests.get(
                f'https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={api_key}'
            )
            
            if response.status_code != 200:
                return Response(
                    {'error': 'Failed to fetch weather data'}, 
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )

            data = response.json()
            
            # Cache the data
            cache.set(self.CACHE_KEY, data, settings.WEATHER_CACHE_TIMEOUT)
            return Response(data)
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
