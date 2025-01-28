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
} from 'src/config/api-client/open-weather-api/open-weather.model';
import {
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

  async findAll() {
    const cachedPlaces = await this.redis.get('places');
    if (cachedPlaces) {
      this.logger.log('Returning all cached places');
      return JSON.parse(cachedPlaces) as PlaceWeatherResponseDto[];
    }

    const cities = await this.getCities();
    this.logger.log(`Found ${cities.length} cities`);

    const placesWithWeather: PlaceWeatherResponseDto[] = [];

    await Promise.all(
      cities.map(async (city) => {
        const weather = await this.getCurrentWeather(city.lat, city.long);
        placesWithWeather.push({ ...city, weather_data: weather });
      }),
    );
    this.logger.log(`Found ${placesWithWeather.length} cities with weather`);

    this.logger.log(`Caching ${placesWithWeather.length} places`);
    await this.redis.set('places', JSON.stringify(placesWithWeather));
    return placesWithWeather;
  }

  async getWeekForecast(lat: string, lon: string) {
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

    this.logger.log(`Caching forecast for ${lat}, ${lon}`);
    await this.redis.set(`forecast:${lat}:${lon}`, JSON.stringify(data));
    return data;
  }

  private async getCities(): Promise<Place[]> {
    const { data } = await firstValueFrom(
      this.httpService
        .get<Place[]>(`${ReservamosApiBaseUrl}${ReservamosApiEndpoints.Places}`)
        .pipe(
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
}
