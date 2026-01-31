import 'dotenv/config.js';
import DeyeCloudApi from "./DeyeCloudApi.js";
import TelegramBot from 'node-telegram-bot-api';
import Station from './Station.js';

const bot = new TelegramBot(process.env.botToken, { polling: true });

const deyeCloudApi = new DeyeCloudApi({
  appId: process.env.appId,
  appSecret: process.env.appSecret,
  baseUrl: process.env.baseUrl,
  email: process.env.email,
  password: process.env.password,
  stationId: process.env.stationId
});

await deyeCloudApi.init();
const station = new Station({});
await updateStationData(station);

setInterval(() => updateStationData(station), 60000);

const statusBtnText = `🔋 Статус`;
bot.on('message', async (msg) => {
  if (msg.text === statusBtnText || msg.text === '/start') {
    await bot.sendMessage(msg.chat.id, station.getInfo(), { parse_mode: "HTML", reply_markup: { keyboard: [[{ text: statusBtnText }]], resize_keyboard: true } });
    return;
  }

  await bot.sendMessage(msg.chat.id, `❌ Невідома команда!`, { parse_mode: "HTML", reply_markup: { keyboard: [[{ text: statusBtnText }]], resize_keyboard: true } });
  return;
});

async function updateStationData(station: Station) {
  console.log(`Updating station data...`);
  const stationData = await deyeCloudApi.getStationData();
  station.updateStation({ batterySOC: stationData.batterySOC, lastUpdateTime: stationData.lastUpdateTime, wirePower: stationData.wirePower });
}

console.log(`Script has been started...`);