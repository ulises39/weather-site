// https://api.openweathermap.org/data/2.5/weather?lat=19.4326077&lon=-99.133208&appid=0eebd1fcf852d29ca0340c5c451d4c9a&units=metric&lang=es

import { environment } from 'src/config/env/env-validation';

export const OpenWeatherApiBaseUrl = 'https://api.openweathermap.org/data/2.5/';

export const OpenWeatherApiEndpoints = {
  Weather: 'weather' as const,
  Forecast: 'forecast' as const,
};

//http://api.openweathermap.org/data/2.5/forecast/daily?q=London&cnt=3&appid={API key}

export const getCurrentWeatherUrl = (
  lat: string,
  lon: string,
  units = 'metric',
  lang = 'es',
) =>
  `${OpenWeatherApiBaseUrl}${OpenWeatherApiEndpoints.Weather}?lat=${lat}&lon=${lon}&appid=${environment.openWeatherApiKey}&units=${units}&lang=${lang}`;

export const getWeekForecastUrl = (
  lat: string,
  lon: string,
  cnt = '7',
  units = 'metric',
  lang = 'es',
) =>
  `${OpenWeatherApiBaseUrl}${OpenWeatherApiEndpoints.Forecast}?lat=${lat}&lon=${lon}&appid=${environment.openWeatherApiKey}&units=${units}&lang=${lang}&cnt=${cnt}`;
