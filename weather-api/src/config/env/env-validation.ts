import { Logger } from '@nestjs/common';
import * as joi from 'joi';

interface EnvironmentVariables {
  PORT: string;
  OPEN_WEATHER_API_KEY: string;
  REDIS_HOST: string;
  REDIS_PORT: number;
}

const envSchema = joi
  .object({
    PORT: joi.string().required(),
    OPEN_WEATHER_API_KEY: joi.string().required(),
    REDIS_HOST: joi.string().required(),
    REDIS_PORT: joi.number().required(),
  })
  .unknown(true);

const { error, value } = envSchema.validate(process.env);

if (error)
  throw new Error(`Environment Config validation error: ${error.message}`);

const envVars: EnvironmentVariables = value;

export const environment = {
  runningPort: envVars.PORT,
  openWeatherApiKey: envVars.OPEN_WEATHER_API_KEY,
  redisHost: envVars.REDIS_HOST,
  redisPort: envVars.REDIS_PORT,
};

Logger.log(`Environment variables set:`);
Logger.log(environment);
