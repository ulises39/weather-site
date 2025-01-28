import { Controller, Get, Query } from '@nestjs/common';
import { PlaceService } from './place.service';

@Controller('place')
export class PlaceController {
  constructor(private readonly placeService: PlaceService) {}

  @Get()
  findAll() {
    return this.placeService.findAll();
  }

  @Get('forecast')
  getWeekForecast(@Query('lat') lat: string, @Query('lon') lon: string) {
    return this.placeService.getWeekForecast(lat, lon);
  }
}
