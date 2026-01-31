import 'dotenv/config.js';
import DeyeCloudApi from "./DeyeCloudApi.js";

const deyeCloudApi = new DeyeCloudApi({
  appId: process.env.appId,
  appSecret: process.env.appSecret,
  baseUrl: process.env.baseUrl,
  email: process.env.email,
  password: process.env.password,
  stationId: process.env.stationId
});

await deyeCloudApi.init();

// await deyeCloudApi.getStationData();
await deyeCloudApi.getStationList();
