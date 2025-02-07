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
  placesLoading: boolean;
  forecastLoading: boolean;
  placeForecast: ForecastApiResponse | null;
  filterPlacesLoading: boolean;
  filteredPlaces: PlaceWeatherApiResponse[];
  error: string | null;
  refreshPlaces: () => Promise<void>;
  filterPlaces: (query: string) => Promise<void>;
  clearFilter: () => Promise<void>;
  getPlaceForecast: (place: PlaceWeatherApiResponse) => Promise<void>;
}

const PlacesContext = createContext<PlacesContextType | undefined>(undefined);

export function PlacesProvider({ children }: { children: ReactNode }) {
  const [placesLoading, setPlacesLoading] = useState(true);
  const [places, setPlaces] = useState<PlaceWeatherApiResponse[]>([]);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [placeForecast, setPlaceForecast] =
    useState<ForecastApiResponse | null>(null);
  const [filterPlacesLoading, setFilterPlacesLoading] = useState(false);
  const [filteredPlaces, setFilteredPlaces] = useState<
    PlaceWeatherApiResponse[]
  >([]);
  const [error, setError] = useState<string | null>(null);

  const fetchPlaces = useCallback(async () => {
    try {
      setPlacesLoading(true);
      const response = await fetch(WEATHER_API_ROUTES.places.list());
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

  const filterPlaces = useCallback(async (query: string) => {
    try {
      setFilterPlacesLoading(true);
      const response = await fetch(WEATHER_API_ROUTES.places.list(query));
      if (!response.ok) {
        throw new Error(`Failed to fetch places by filter ${query}`);
      }
      const data = (await response.json()) as PlaceWeatherApiResponse[];
      setFilteredPlaces(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Failed to fetch places by filter ${query}`
      );
    } finally {
      setFilterPlacesLoading(false);
    }
  }, []);

  const clearFilter = useCallback(async () => {
    setFilteredPlaces([]);
    await fetchPlaces();
  }, [fetchPlaces]);

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
        filterPlaces,
        filteredPlaces,
        filterPlacesLoading,
        clearFilter,
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

