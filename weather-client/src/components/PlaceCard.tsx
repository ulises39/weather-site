// src/app/components/PlaceCard.tsx
"use client";
import { WEATHER_API_ROUTES } from "@/config/weather-api-routes";
import Image from "next/image";
import { PlaceWeatherProps } from "../types/place-weather";

interface PlaceCardProps {
  place: PlaceWeatherProps;
  timestamp?: number;
  onClick?: () => void;
}

export function PlaceCard({ place, timestamp, onClick }: PlaceCardProps) {
  const iconUrl = WEATHER_API_ROUTES.icons.url(place.icon);
  const date = timestamp
    ? new Date(timestamp * 1000).toLocaleDateString("es-MX", {
      weekday: "long",
      month: "long",
      day: "numeric",
    })
    : "Hoy";

  return (
    <div
      className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-semibold">{place.city}</h2>
            <p className="text-purple-200">
              {place.state}, {place.country}
            </p>
            <p className="text-purple-200 text-sm mt-1 capitalize">{date}</p>
          </div>
          <div className="text-5xl font-bold">
            {Math.round(place.temperature)}°C
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Image
            src={iconUrl}
            alt={place.description}
            width={50}
            height={50}
            className="w-12 h-12"
          />
          <div className="text-purple-200 capitalize">{place.description}</div>
        </div>
      </div>
    </div>
  );
}

