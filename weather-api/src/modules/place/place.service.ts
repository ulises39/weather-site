import { RedisService } from '@liaoliaots/nestjs-redis';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { catchError, firstValueFrom } from 'rxjs';
import {
  getCurrentWeatherUrl,
  getWeekForecastUrl,
} from 'src/config/api-client/open-weather-api/config';
import {
  CurrentWeatherApiResponse,
  ForecastApiResponse,
  List,
} from 'src/config/api-client/open-weather-api/open-weather.model';
import {
  getUrlWithParam,
  ReservamosApiBaseUrl,
  ReservamosApiEndpoints,
} from 'src/config/api-client/reservamos-api/config';
import { Place } from 'src/config/api-client/reservamos-api/reservamos-places.model';
import { PlaceWeatherResponseDto } from './dto/place-weather-response.dto';

@Injectable()
export class PlaceService {
  private readonly logger = new Logger(PlaceService.name);
  private readonly redis: Redis | null;

  constructor(
    private readonly httpService: HttpService,
    private readonly redisService: RedisService,
  ) {
    this.redis = this.redisService.getOrThrow();
  }

  async findAll(param?: string) {
    const redisKey = param ? `places:${param}` : 'places';

    const cachedPlaces = await this.redis.get(redisKey);
    if (cachedPlaces) {
      this.logger.log(`Returning all cached places for ${redisKey}`);
      return JSON.parse(cachedPlaces) as PlaceWeatherResponseDto[];
    }

    const cities = await this.getCities(param);
    this.logger.log(`Found ${cities.length} cities`);

    const placesWithWeather: PlaceWeatherResponseDto[] = [];

    await Promise.all(
      cities.map(async (city) => {
        const weather = await this.getCurrentWeather(city.lat, city.long);
        placesWithWeather.push({ ...city, weather_data: weather });
      }),
    );
    this.logger.log(`Found ${placesWithWeather.length} cities with weather`);

    this.logger.log(
      `Caching ${placesWithWeather.length} places with key ${redisKey}`,
    );
    await this.redis.set(redisKey, JSON.stringify(placesWithWeather));
    return placesWithWeather;
  }

  async getWeekForecast(
    lat: string,
    lon: string,
  ): Promise<ForecastApiResponse> {
    const cachedForecast = await this.redis.get(`forecast:${lat}:${lon}`);
    if (cachedForecast) {
      this.logger.log(`Returning cached forecast for ${lat}, ${lon}`);
      return JSON.parse(cachedForecast) as ForecastApiResponse;
    }
    const { data } = await firstValueFrom(
      this.httpService
        .get<ForecastApiResponse>(getWeekForecastUrl(lat, lon))
        .pipe(
          catchError((error) => {
            this.logger.error(
              `Error getting weather 7-day forecast for ${lat}, ${lon}: ${error}`,
            );
            throw error;
          }),
        ),
    );

    const dailyForecasts = this.groupForecastsByDay(data.list);

    const formattedForecast: ForecastApiResponse = {
      ...data,
      list: dailyForecasts,
    };

    this.logger.log(`Caching forecast for ${lat}, ${lon}`);
    await this.redis.set(
      `forecast:${lat}:${lon}`,
      JSON.stringify(formattedForecast),
    );
    return formattedForecast;
  }

  async getPlacesWeatherByFilter(param: string) {
    const { data } = await firstValueFrom(
      this.httpService.get<Place[]>(getUrlWithParam(param)).pipe(
        catchError((error) => {
          this.logger.error(`Error getting places with query param: ${error}`);
          throw error;
        }),
      ),
    );

    const cities = data.filter((city) => city.result_type === 'city');

    const placesWithWeather: PlaceWeatherResponseDto[] = [];

    await Promise.all(
      cities.map(async (city) => {
        const weather = await this.getCurrentWeather(city.lat, city.long);
        placesWithWeather.push({ ...city, weather_data: weather });
      }),
    );
    this.logger.log(
      `Found ${placesWithWeather.length} cities with weather and query param ${param}`,
    );

    return placesWithWeather;
  }

  private async getCities(param?: string): Promise<Place[]> {
    const url = param
      ? getUrlWithParam(param)
      : `${ReservamosApiBaseUrl}${ReservamosApiEndpoints.Places}`;

    const { data } = await firstValueFrom(
      this.httpService.get<Place[]>(url).pipe(
        catchError((error) => {
          this.logger.error(
            `Error getting places from Reservamos-API: ${error}`,
          );
          throw error;
        }),
      ),
    );

    return data.filter((place) => place.result_type === 'city');
  }

  private async getCurrentWeather(
    lat: string,
    lon: string,
  ): Promise<CurrentWeatherApiResponse> {
    this.logger.log(
      `Getting current weather from OpenWeather-API for lat: ${lat} and lon: ${lon}`,
    );
    this.logger.log(`Current weather URL: ${getCurrentWeatherUrl(lat, lon)}`);
    const { data } = await firstValueFrom(
      this.httpService
        .get<CurrentWeatherApiResponse>(getCurrentWeatherUrl(lat, lon))
        .pipe(
          catchError((error) => {
            this.logger.error(
              `Error getting current weather from OpenWeather-API for lat: ${lat} and lon: ${lon}: ${error}`,
            );
            throw error;
          }),
        ),
    );

    return data;
  }

  private groupForecastsByDay(list: List[]): List[] {
    // First, group forecasts by day
    const forecastsByDay = list.reduce(
      (acc: { [key: string]: List[] }, forecast: List) => {
        const date = new Date(forecast.dt * 1000).toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(forecast);
        return acc;
      },
      {},
    );

    // For each day, get the forecast closest to noon
    const dailyForecasts = Object.entries(forecastsByDay).map(
      ([date, forecasts]) => {
        // Sort forecasts by how close they are to noon (12:00)
        return forecasts.reduce((closest: List, current: List) => {
          const currentHour = new Date(current.dt * 1000).getHours();
          const closestHour = new Date(closest.dt * 1000).getHours();

          // Calculate distance from noon (12:00)
          const currentDistance = Math.abs(12 - currentHour);
          const closestDistance = Math.abs(12 - closestHour);

          return currentDistance < closestDistance ? current : closest;
        }, forecasts[0]);
      },
    );

    // Sort by date and limit to 5 days
    return dailyForecasts.sort((a: List, b: List) => a.dt - b.dt).slice(0, 5);
  }
}
