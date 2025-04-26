import React, { useEffect, useState } from 'react';
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
    "feels_like": 0,
    "humidity": 0,
    "pressure": 0
  },
  "wind": {
    "speed": 0
  },
  "rain": null
}

function Weather() {
  const [weatherData, setWeatherData] = useState(initialWeatherData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const apiKey = (import.meta as any).env.VITE_WEATHER_API_KEY as string;
        const lon = 5.51259;
        const lat = 32.61336;

        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch weather data');
        }

        const data = await response.json();
        setWeatherData(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching weather data:', err);
        setError('Failed to load weather data');
        setLoading(false);
      }
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
  const options = { weekday: 'long' };
  const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' as const }).format(currentDate);
  const formattedDate = `${dayName} ${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`;

  if (loading) {
    return (
      <div className="fixed top-12 left-0 p-2 m-2 w-[15%]">
        <div className="flex flex-col bg-red-100 rounded-lg p-4 shadow-md">
          <p>Loading weather data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed top-12 left-0 p-2 m-2 w-[15%]">
        <div className="flex flex-col bg-red-100 rounded-lg p-4 shadow-md">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-12 left-0 p-2 m-2 w-[15%]">
      {/* Card Container */}
      <div className="flex flex-col bg-violet-400/80 rounded-lg p-2 shadow-md">
        {/* City and Date */}
        <div className="flex gap-2 text-yellow-50">
          <p className="text-[1.5rem]">EL Hadjira</p>
          <p className="text-[0.9rem] mt-[0.8rem]">{formattedDate}</p>
        </div>
        {/* ==City and Date== */}

        {/* Weather Icon and Description */}
        <div className="flex items-center text-yellow-50">
          <img src={iconUrl} alt={weatherDescription} className="w-16 h-16" />
          <p className="text-lg capitalize">{t(`weather.${weatherDescription}`)}</p>
        </div>

        {/* Temp */}
        <div className='text-yellow-50'>
          <p className="text-[3rem]">{tempCelsius}°C</p>
          <p className="text-sm" dir={i18n.language === "ar" ? "rtl" : "ltr"}>{t("weather.feelsLike")}: {feelsLike}°C</p>
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
          {weatherData.rain && (
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