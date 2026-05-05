import React, { useState, useEffect } from 'react';
import { Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudSnow, Sun, Moon } from 'lucide-react';
import { cn } from '../utils';

interface WeatherData {
  temperature: number;
  weathercode: number;
  is_day: number;
}

export const CuacaWidget: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Coordinates for Sekura, Sambas, West Kalimantan
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=1.4687&longitude=109.2221&current_weather=true&timezone=Asia%2FJakarta');
        if (!res.ok) throw new Error('Failed to fetch weather');
        const data = await res.json();
        setWeather(data.current_weather);
      } catch (error) {
        console.error('Error fetching weather:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 30 * 60 * 1000); // 30 minutes
    return () => clearInterval(interval);
  }, []);

  if (isLoading || !weather) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 dark:bg-black/20 rounded-lg animate-pulse">
        <div className="w-6 h-6 bg-white/10 dark:bg-zinc-700 rounded-full"></div>
        <div className="w-12 h-4 bg-white/10 dark:bg-zinc-700 rounded"></div>
      </div>
    );
  }

  // WMO Weather interpretation codes (https://open-meteo.com/en/docs)
  const getWeatherIcon = (code: number, isDay: number) => {
    switch (code) {
      case 0: // Clear sky
        return isDay ? <Sun className="w-6 h-6 text-amber-500 animate-[spin_10s_linear_infinite]" /> : <Moon className="w-6 h-6 text-blue-300 animate-pulse" />;
      case 1:
      case 2:
      case 3: // Mainly clear, partly cloudy, and overcast
        return <Cloud className="w-6 h-6 text-zinc-400 animate-[bounce_3s_infinite]" />;
      case 45:
      case 48: // Fog and depositing rime fog
        return <CloudFog className="w-6 h-6 text-zinc-400 animate-pulse" />;
      case 51:
      case 53:
      case 55: // Drizzle
        return <CloudDrizzle className="w-6 h-6 text-blue-400 animate-[bounce_2s_infinite]" />;
      case 61:
      case 63:
      case 65: // Rain
      case 80:
      case 81:
      case 82: // Rain showers
        return <CloudRain className="w-6 h-6 text-blue-500 animate-[bounce_1.5s_infinite]" />;
      case 71:
      case 73:
      case 75: // Snow fall
      case 77: // Snow grains
      case 85:
      case 86: // Snow showers
        return <CloudSnow className="w-6 h-6 text-sky-300 animate-pulse" />;
      case 95: // Thunderstorm
      case 96:
      case 99: // Thunderstorm with slight and heavy hail
        return <CloudLightning className="w-6 h-6 text-amber-500 animate-pulse" />;
      default:
        return <Cloud className="w-6 h-6 text-zinc-400" />;
    }
  };

  const getWeatherDescription = (code: number) => {
    switch (code) {
      case 0: return 'Cerah';
      case 1: return 'Sebagian Cerah';
      case 2: return 'Berawan';
      case 3: return 'Mendung';
      case 45: case 48: return 'Berkabut';
      case 51: case 53: case 55: return 'Gerimis';
      case 61: case 63: case 65: return 'Hujan';
      case 71: case 73: case 75: case 77: return 'Salju';
      case 80: case 81: case 82: return 'Hujan Deras';
      case 85: case 86: return 'Hujan Salju';
      case 95: case 96: case 99: return 'Badai Petir';
      default: return 'Tidak Diketahui';
    }
  };

  return (
    <div className="relative flex items-center gap-3 px-3 py-1.5 bg-white/5 dark:bg-black/20 rounded-xl border border-white/10 dark:border-white/5 hover:bg-white/10 dark:hover:bg-black/40 transition-colors cursor-default group backdrop-blur-sm">
      <div className="relative">
        {getWeatherIcon(weather.weathercode, weather.is_day)}
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-black text-zinc-900 dark:text-white leading-none drop-shadow-sm">
          {Math.round(weather.temperature)}°C
        </span>
        <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider mt-0.5 drop-shadow-sm">
          {getWeatherDescription(weather.weathercode)}
        </span>
      </div>

      {/* Custom Tooltip */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[10px] font-black tracking-widest rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-2xl border border-white/10">
        SEKURA
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-b-zinc-900 dark:border-b-white"></div>
      </div>
    </div>
  );
};
