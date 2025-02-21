import { Controller, Get, Query } from '@nestjs/common';
import { PlaceService } from './place.service';

@Controller('places')
export class PlaceController {
  constructor(private readonly placeService: PlaceService) {}

  @Get()
  findAll(@Query('q') param: string) {
    return this.placeService.findAll(param);
  }

  @Get('forecast')
  getWeekForecast(@Query('lat') lat: string, @Query('lon') lon: string) {
    return this.placeService.getWeekForecast(lat, lon);
  }
}
