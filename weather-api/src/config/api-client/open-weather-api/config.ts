import { environment } from 'src/config/env/env-validation';

export const OpenWeatherApiBaseUrl = 'https://api.openweathermap.org/data/2.5/';

export const OpenWeatherApiEndpoints = {
  Weather: 'weather' as const,
  Forecast: 'forecast' as const,
};

// https://api.openweathermap.org/data/2.5/weather?lat=19.4326077&lon=-99.133208&appid=0eebd1fcf852d29ca0340c5c451d4c9a&units=metric&lang=es
export const getCurrentWeatherUrl = (
  lat: string,
  lon: string,
  units = 'metric',
  lang = 'es',
) => {
  const params = new URLSearchParams({
    lat,
    lon,
    units,
    lang,
    appid: environment.openWeatherApiKey,
  });
  return `${OpenWeatherApiBaseUrl}${OpenWeatherApiEndpoints.Weather}?${params}`;
};

// Example URL http://api.openweathermap.org/data/2.5/forecast/daily?q=London&cnt=40&appid={API key}
export const getWeekForecastUrl = (
  lat: string,
  lon: string,
  cnt = '40',
  units = 'metric',
  lang = 'es',
) => {
  const params = new URLSearchParams({
    lat,
    lon,
    units,
    lang,
    cnt,
    appid: environment.openWeatherApiKey,
  });

  return `${OpenWeatherApiBaseUrl}${OpenWeatherApiEndpoints.Forecast}?${params}`;
};
