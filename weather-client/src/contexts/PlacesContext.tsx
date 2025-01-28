"use client";
import { WEATHER_API_ROUTES } from "@/config/weather-api-routes";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  ForecastApiResponse,
  PlaceWeatherApiResponse,
} from "../types/place-weather-response";

interface PlacesContextType {
  places: PlaceWeatherApiResponse[];
  placesLoading: boolean; // renamed from loading
  forecastLoading: boolean; // new loading state
  error: string | null;
  refreshPlaces: () => Promise<void>;
  getPlaceForecast: (place: PlaceWeatherApiResponse) => Promise<void>;
  placeForecast: ForecastApiResponse | null;
}

const PlacesContext = createContext<PlacesContextType | undefined>(undefined);

export function PlacesProvider({ children }: { children: ReactNode }) {
  const [places, setPlaces] = useState<PlaceWeatherApiResponse[]>([]);
  const [placeForecast, setPlaceForecast] =
    useState<ForecastApiResponse | null>(null);
  const [placesLoading, setPlacesLoading] = useState(true);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlaces = useCallback(async () => {
    try {
      setPlacesLoading(true);
      const response = await fetch(WEATHER_API_ROUTES.places.list);
      if (!response.ok) {
        throw new Error("Failed to fetch places");
      }
      const data = (await response.json()) as PlaceWeatherApiResponse[];
      setPlaces(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch places");
    } finally {
      setPlacesLoading(false);
    }
  }, []); // memoize fetchPlaces

  const getPlaceForecast = useCallback(
    async (place: PlaceWeatherApiResponse) => {
      try {
        setForecastLoading(true);
        const response = await fetch(
          WEATHER_API_ROUTES.places.weekForecast(place.lat, place.long)
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch forecast for ${place.city_name}`);
        }
        const data = (await response.json()) as ForecastApiResponse;
        setPlaceForecast(data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : `Failed to fetch forecast for ${place.city_name}`
        );
      } finally {
        setForecastLoading(false);
      }
    },
    []
  ); // memoize getPlaceForecast

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  return (
    <PlacesContext.Provider
      value={{
        places,
        placesLoading,
        forecastLoading,
        error,
        refreshPlaces: fetchPlaces,
        getPlaceForecast,
        placeForecast,
      }}
    >
      {children}
    </PlacesContext.Provider>
  );
}

export function usePlacesContext() {
  const context = useContext(PlacesContext);
  if (context === undefined) {
    throw new Error("usePlacesContext must be used within a PlacesProvider");
  }
  return context;
}

