"use client";
import { PlaceWeatherApiResponse } from "@/types/place-weather-response";
import { mapPlaceWeatherApiResponseToPlaceWeatherProps } from "@/utils/mappers";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { usePlacesContext } from "../contexts/PlacesContext";
import { PlaceCard } from "./PlaceCard";

export function Places() {
  const {
    places,
    placesLoading,
    filterPlacesLoading,
    filteredPlaces,
    filterPlaces,
    clearFilter,
    error,
  } = usePlacesContext();
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const isLoading = placesLoading || filterPlacesLoading;

  if (isLoading) {
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

  const displayPlaces = filteredPlaces.length > 0 ? filteredPlaces : places;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchQuery("");
      await clearFilter();
    }
    await filterPlaces(searchQuery);
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

      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar ciudad..."
            className="flex-1 p-2 rounded-lg border border-gray-300 text-black"
          />
          <button
            type="submit"
            className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
          >
            Buscar
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayPlaces.map((place) => (
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

