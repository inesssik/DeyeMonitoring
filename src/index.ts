import 'reflect-metadata';
import { DeyeCloudApi } from "./DeyeCloudApi.js";
import { Station } from './Station.js';
import { Bot } from './Bot.js';
import { Database } from './Database.js';
import { NotificationService } from './NotificationService.js';
import { container } from 'tsyringe';
import { ConfigService } from './ConfigService.js';

(async (): Promise<void> => {
  const config = container.resolve(ConfigService);

  const db = container.resolve(Database);
  await db.initPool();

  const api = container.resolve(DeyeCloudApi);
  await api.init();

  const station = container.resolve(Station);
  await station.refreshStation();
  station.initAutoRefreshing(config.values.REFRESH_INTERVAL_MS);

  container.resolve(NotificationService);
  container.resolve(Bot);

  console.log(`Script has been started...`);
})();