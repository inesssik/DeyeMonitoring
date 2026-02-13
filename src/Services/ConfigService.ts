import { singleton } from "tsyringe";
import { z } from 'zod';
import 'dotenv/config.js';

const configSchema = z.object({
  DB_SERVER: z.string(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_DATABASE: z.string(),
  APP_ID: z.string(),
  APP_SECRET: z.string(),
  BASE_URL: z.url(),
  EMAIL: z.email(),
  PASSWORD: z.string(),
  STATION_ID: z.string(),
  BOT_TOKEN: z.string(),
  REFRESH_INTERVAL_MS: z.coerce.number().default(60000),
});

@singleton()
export class ConfigService {
  public readonly values: z.infer<typeof configSchema>;

  constructor() {
    const parsed = configSchema.safeParse(process.env);
    if (!parsed.success) {
      throw new Error(`Config validation error: ${parsed.error.message}`);
    }
    this.values = parsed.data;
  }
}