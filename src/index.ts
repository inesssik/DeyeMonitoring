import 'dotenv/config.js';
import DeyeCloudApi from "./DeyeCloudApi.js";
import TelegramBot from 'node-telegram-bot-api';
import Station from './Station.js';
import Bot from './Bot.js';

const deyeCloudApi = new DeyeCloudApi({
  appId: process.env.appId,
  appSecret: process.env.appSecret,
  baseUrl: process.env.baseUrl,
  email: process.env.email,
  password: process.env.password,
  stationId: process.env.stationId
});
await deyeCloudApi.init();

const station = new Station({ deyeCloudApi });
station.initAutoRefreshing(60000);
await station.refreshStation();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const bot = new Bot({
  tgBot: new TelegramBot(process.env.botToken, { polling: true }),
  station
});

console.log(`Script has been started...`);