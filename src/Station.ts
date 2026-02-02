import { TZDate } from "@date-fns/tz";
import { format } from 'date-fns';
import { StationStatus } from "./Types/types.js";
import DeyeCloudApi from "./DeyeCloudApi.js";

interface StationConstructor {
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
  private wirePower: number = 0;
  private batterySOC: number;
  private lastUpdateTime: number;
  private status: StationStatus = StationStatus.undefined;

  constructor(params: StationConstructor) {
    this.updateStation(params);
  }

  public getInfo(): string {
    return `${this.status === StationStatus.noGrid ? '🔴' : '🟢'} <b>Статус:</b> ${this.status}\n${this.batterySOC > 20 ? `🔋` : `🪫`} <b>Заряд батареї:</b> ${this.batterySOC}%\n⌚ <b>Оновлено:</b> ${format(new TZDate(this.lastUpdateTime * 1000, 'Europe/Kyiv'), 'dd.MM.yyyy HH:mm')}`;
  }

  private updateStation(params: RefreshStationParams): void {
    this.wirePower = params.wirePower ?? 0;
    this.batterySOC = params.batterySOC ?? 0;
    this.lastUpdateTime = params.lastUpdateTime ?? 0;
    this.refreshStatus();
    return;
  }

  public async refreshStation(deyeCloudApi: DeyeCloudApi): Promise<void> {
    console.log(`Updating station data...`);
    const stationData = await deyeCloudApi.getStationData();
    this.updateStation({ batterySOC: stationData.batterySOC, lastUpdateTime: stationData.lastUpdateTime, wirePower: stationData.wirePower });
    return;
  }

  public initAutoRefreshing(params: { deyeCloudApi: DeyeCloudApi, ms: number }): Promise<void> {
    setInterval(async () => this.refreshStation(params.deyeCloudApi), params.ms);
    return;
  }

  private refreshStatus() {
    if (this.wirePower === 0) {
      this.status = StationStatus.noGrid;
    } else {
      this.status = StationStatus.withGrid;
    }

    return;
  }
}

export default Station;