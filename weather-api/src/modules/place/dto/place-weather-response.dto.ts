import { CurrentWeatherApiResponse } from 'src/config/api-client/open-weather-api/open-weather.model';
import { Place } from 'src/config/api-client/reservamos-api/reservamos-places.model';

export class PlaceWeatherResponseDto implements Place {
  id: number;
  slug: string;
  city_slug: string;
  display: string;
  ascii_display: string;
  city_name: string;
  city_ascii_name: string;
  state: string;
  country: string;
  lat: string;
  long: string;
  result_type: string;
  popularity: string;
  weather_data: CurrentWeatherApiResponse;
}
