import { RedisModule } from '@liaoliaots/nestjs-redis';
import { Module } from '@nestjs/common';
import { PlaceModule } from './modules/place/place.module';
import { environment } from './config/env/env-validation';

@Module({
  imports: [
    RedisModule.forRoot({
      config: {
        host: environment.redisHost,
        port: environment.redisPort,
      },
    }),
    PlaceModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
