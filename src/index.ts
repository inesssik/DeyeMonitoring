import 'reflect-metadata';
import { DeyeCloudApiService } from "./Services/DeyeCloudApiService.js";
import { StationService } from './Services/StationService.js';
import { NotificationService } from './Services/NotificationService.js';
import { container } from 'tsyringe';
import { ConfigService } from './Services/ConfigService.js';
import { BotService } from './Services/BotService.js';
import { DatabaseService } from './Services/DatabaseService.js';

(async (): Promise<void> => {
  const config = container.resolve(ConfigService);

  const db = container.resolve(DatabaseService);
  await db.initPool();

  const api = container.resolve(DeyeCloudApiService);
  await api.init();

  const station = container.resolve(StationService);
  await station.refreshStation();
  station.initAutoRefreshing(config.values.REFRESH_INTERVAL_MS);

  container.resolve(NotificationService);
  container.resolve(BotService);

  console.log(`Script has been started...`);
})();