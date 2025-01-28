"use client";
import { usePlacesContext } from "@/contexts/PlacesContext";
import { PlaceWeatherProps } from "@/types/place-weather";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PlaceCard } from "./PlaceCard";

export default function PlaceForecast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { places, placeForecast, forecastLoading, error, getPlaceForecast } =
    usePlacesContext();
  const [placeWeatherForecast, setPlaceWeatherForecast] = useState<
    PlaceWeatherProps[]
  >([]);
  const cityNameParam = searchParams.get("city");
  const lastFetchedCity = useRef<string | null>(null);

  useEffect(() => {
    if (!cityNameParam) {
      notFound();
    }

    if (
      places.length > 0 &&
      !places.some((p) => p.city_name === cityNameParam)
    ) {
      notFound();
    }
  }, [cityNameParam, places]);

  // Only fetch forecast when city changes
  useEffect(() => {
    const fetchForecast = async () => {
      if (!cityNameParam || !places.length) return;
      if (cityNameParam === lastFetchedCity.current) return;

      const place = places.find((p) => p.city_name === cityNameParam);
      if (!place) return;

      lastFetchedCity.current = cityNameParam;
      await getPlaceForecast(place);
    };

    fetchForecast();
  }, [cityNameParam, places, getPlaceForecast]);

  // Transform forecast data when it changes
  useEffect(() => {
    if (!placeForecast || !cityNameParam) return;

    const place = places.find((p) => p.city_name === cityNameParam);
    if (!place) return;

    const forecasts = placeForecast.list.map((forecast) => ({
      country: place.country,
      state: place.state,
      city: cityNameParam,
      temperature: forecast.main.temp,
      description: forecast.weather[0].description,
      icon: forecast.weather[0].icon,
      daytime: forecast.dt,
    }));

    setPlaceWeatherForecast(forecasts);
  }, [placeForecast, cityNameParam, places]);

  // Reset lastFetchedCity when component unmounts
  useEffect(() => {
    return () => {
      lastFetchedCity.current = null;
    };
  }, []);

  if (forecastLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 p-4">Error: {error}</div>;
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center gap-4 mb-8">
        <button
          onClick={() => router.push("/")}
          className="text-white bg-purple-500 px-4 py-2 rounded-full hover:bg-purple-600 transition-colors"
        >
          ← Regresar a inicio
        </button>
        <h1 className="text-3xl font-bold text-white text-center">
          Pronóstico para {cityNameParam} por los próximos 5 días
        </h1>
      </div>

      <div className="flex flex-col space-y-4 max-w-2xl mx-auto">
        {placeWeatherForecast.map((forecast) => (
          <div
            key={forecast.daytime}
            className="transform transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
          >
            <PlaceCard place={forecast} timestamp={forecast.daytime} />
          </div>
        ))}
      </div>
    </main>
  );
}

