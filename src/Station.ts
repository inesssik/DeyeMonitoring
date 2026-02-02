import { TZDate } from "@date-fns/tz";
import { format } from 'date-fns';
import { StationStatus } from "./Types/types.js";
import DeyeCloudApi from "./DeyeCloudApi.js";

interface StationConstructor {
  deyeCloudApi: DeyeCloudApi;
  wirePower?: number;
  batterySOC?: number;
  lastUpdateTime?: number;
}

interface RefreshStationParams {
  wirePower?: number;
  batterySOC?: number;
  lastUpdateTime?: number;
}

class Station {
  private readonly deyeCloudApi: DeyeCloudApi;

  private wirePower: number = 0;
  private batterySOC: number;
  private lastUpdateTime: number;
  private status: StationStatus = StationStatus.undefined;

  constructor(params: StationConstructor) {
    this.deyeCloudApi = params.deyeCloudApi;
    this.updateStation(params);
  }

  public getInfo(): string {
    const formatedTime = format(new TZDate(this.lastUpdateTime * 1000, 'Europe/Kyiv'), 'dd.MM.yyyy HH:mm');
    return `${this.status === StationStatus.noGrid ? '🔴' : '🟢'} <b>Статус:</b> ${this.status}\n${this.batterySOC > 20 ? `🔋` : `🪫`} <b>Заряд батареї:</b> ${this.batterySOC}%\n⌚ <b>Оновлено:</b> ${formatedTime}`;
  }

  private updateStation(params: RefreshStationParams): void {
    this.wirePower = params.wirePower ?? 0;
    this.batterySOC = params.batterySOC ?? 0;
    this.lastUpdateTime = params.lastUpdateTime ?? 0;
    this.refreshStatus();
    return;
  }

  public async refreshStation(): Promise<void> {
    console.log(`Updating station data...`);
    const stationData = await this.deyeCloudApi.getStationData();
    this.updateStation({ batterySOC: stationData.batterySOC, lastUpdateTime: stationData.lastUpdateTime, wirePower: stationData.wirePower });
    return;
  }

  public initAutoRefreshing(ms: number): Promise<void> {
    setInterval(() => this.refreshStation(), ms);
    return;
  }

  private refreshStatus(): Promise<void> {
    if (this.wirePower === 0) {
      this.status = StationStatus.noGrid;
    } else {
      this.status = StationStatus.withGrid;
    }

    return;
  }
}

export default Station;

