import React, { useEffect, useState } from 'react';
import api from '../../api';
import { useTranslation } from "react-i18next";

// This will be replaced with API data
const initialWeatherData = {
  "weather": [
    {
      "description": "loading...",
      "icon": "03d"
    }
  ],
  "main": {
    "temp": 0,
    "feels_like":0,
    "humidity": 0,
    "pressure": 0
  },
  "name" : "Loading",
  "wind": {
    "speed": 0
  },
  "rain": null
}

function Weather() {
  const [weatherData, setWeatherData] = useState(initialWeatherData);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const { t, i18n } = useTranslation();

  // Removed local storage handling as it's now managed by Redis in the backend

  useEffect(() => {
    const fetchWeatherData = async () => {
        await api.get('/api/weather').then((response) => {
            setWeatherData(response.data);
            setLoading(false);
        }).catch((error) => {
          console.error('Error fetching weather data:', error);
          setError(error.message || 'Failed to fetch weather data');
        });
    };

    fetchWeatherData();
  }, []);

  // Convert temperature from Kelvin to Celsius
  const tempCelsius = Math.round(weatherData.main.temp - 273.15);
  const feelsLike = Math.round(weatherData.main.feels_like - 273.15);

  // Get weather description and icon
  const weatherDescription = weatherData.weather[0].description;
  const weatherIcon = weatherData.weather[0].icon;
  const iconUrl = `http://openweathermap.org/img/wn/${weatherIcon}@2x.png`;

  // Format current date
  const currentDate = new Date();
  const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' as const }).format(currentDate);
  const formattedDate = `${dayName} ${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`;

  // Responsive container classes
  // On mobile: static, full width, top; on desktop: fixed sidebar
  const containerClass =
    "z-10 p-2 m-1" +
    "w-full static top-0 left-0 sm:w-[15%] sm:fixed sm:top-12 sm:left-0";

  if (loading) {
    return (
      <div className={containerClass}>
        <div className="flex flex-col bg-red-100 rounded-lg p-4 shadow-md">
          <p>Loading weather data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={containerClass}>
        <div className="flex flex-col bg-red-100 rounded-lg p-4 shadow-md">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      {/* Card Container */}
      <div className="flex flex-col bg-violet-400/80 rounded-lg p-2 shadow-md">
        {/* City and Date */}
        <div className="flex gap-2 justify-between text-yellow-50">
          <p className="text-[1.5rem]">{weatherData.name} {/* El Hadjira */ }</p>
          <p className="text-[0.9rem] mt-[0.8rem]">{formattedDate}</p>
        </div>
        {/* ==City and Date== */}

        {/* Weather Icon and Description */}
        <div className="flex items-center justify-center text-yellow-50">
          <img src={iconUrl} alt={weatherDescription} className="w-16 h-16" />
          <p className="text-lg capitalize">{t(`weather.${weatherDescription}`)}</p>
        </div>

        {/* Temp */}
        <div className='text-yellow-50'>
          <p className="text-[3rem]">{tempCelsius}°C</p>
          <p className="text-sm" dir={i18n.language === "ar" ? "rtl" : "ltr"}>{t("weather.feelsLike")}: <span dir="ltr">{feelsLike}°C</span></p>
        </div>
        {/* ==Temp== */}

        {/* Additional Weather Info */}
        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
          <div className='text-yellow-50'>
            <p className="font-semibold">{t("weather.humidity")}</p>
            <p>{weatherData.main.humidity}%</p>
          </div>
          <div className='text-yellow-50'>
            <p className="font-semibold">{t("weather.wind")}</p>
            <p>{weatherData.wind.speed} m/s</p>
          </div>
          <div className='text-yellow-50'>
            <p className="font-semibold">{t("weather.pressure")}</p>
            <p>{weatherData.main.pressure} hPa</p>
          </div>
          {weatherData.rain && weatherData.rain["1h"] !== undefined && (
            <div className='text-yellow-50'>
              <p className="font-semibold">Rain (1h)</p>
              <p>{weatherData.rain["1h"]} mm</p>
            </div>
          )}
        </div>
      </div>
      {/* ==Card Container== */}
    </div>
  )
}

export default Weather;