"use client";
import { mapPlaceWeatherApiResponseToPlaceWeatherProps } from "@/utils/mappers";
import { usePlacesContext } from "../contexts/PlacesContext";
import { PlaceCard } from "./PlaceCard";
import { useRouter } from "next/navigation";
import { PlaceWeatherApiResponse } from "@/types/place-weather-response";

export function Places() {
  const { places, placesLoading, error } = usePlacesContext();
  const router = useRouter();

  if (placesLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 p-4">Error: {error}</div>;
  }

  const handlePlaceClick = (place: PlaceWeatherApiResponse) => {
    router.push(`/forecast?city=${encodeURIComponent(place.city_name)}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-white-800">
        Clima de Ciudades Populares
      </h1>
      <h2 className="text-2xl font-bold mb-8 text-white-800">
        Haz click en una ciudad para ver el pronóstico del clima por los
        próximos 5 días
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {places.map((place) => (
          <PlaceCard
            key={place.id}
            place={mapPlaceWeatherApiResponseToPlaceWeatherProps(place)}
            onClick={() => handlePlaceClick(place)}
          />
        ))}
      </div>
    </div>
  );
}

