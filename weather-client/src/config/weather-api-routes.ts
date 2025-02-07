import { environment } from "./environment";

export const WEATHER_API_ROUTES = {
  places: {
    list: (query?: string) =>
      query
        ? `${environment.API_BASE_URL}/places?q=${query}`
        : `${environment.API_BASE_URL}/places`,
    weekForecast: (lat: string, lon: string) =>
      `${environment.API_BASE_URL}/places/forecast?lat=${lat}&lon=${lon}`,
  },
  icons: {
    url: (iconCode: string) =>
      `https://openweathermap.org/img/wn/${iconCode}@2x.png`,
  },
} as const;

