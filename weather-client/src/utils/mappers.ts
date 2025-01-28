import { PlaceWeatherProps } from "@/types/place-weather";
import { PlaceWeatherApiResponse } from "@/types/place-weather-response";

export const mapPlaceWeatherApiResponseToPlaceWeatherProps = (
  apiResponse: PlaceWeatherApiResponse
) => {
  const { city_name, state, country } = apiResponse;
  const temp = apiResponse.weather_data.main.temp;
  const icon = apiResponse.weather_data.weather[0].icon;
  const description = apiResponse.weather_data.weather[0].description;
  return {
    country,
    state,
    city: city_name,
    temperature: temp,
    description,
    icon,
  } as PlaceWeatherProps;
};

// export const mapForecastApiResponseToPlaceWeatherProps = (
//   apiResponse: ForecastApiResponse
// ) => {
//   return {
//     country: apiResponse.city.country,
//     state: apiResponse.city.state,
//     city: apiResponse.city.name,
//     temperature: apiResponse.list[0].main.temp,
//     description: apiResponse.list[0].weather[0].description,
//     icon: apiResponse.list[0].weather[0].icon
//   } as PlaceWeatherProps;
// };

