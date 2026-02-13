import { StationStatus } from "../Types/types.js";
import { DeyeCloudApiService } from "./DeyeCloudApiService.js";
import { EventEmitter } from 'events';
import { singleton } from "tsyringe";

const formatDateWithTimezone = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  const formatter = new Intl.DateTimeFormat('uk-UA', {
    timeZone: 'Europe/Kyiv', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false
  });

  const parts = formatter.formatToParts(date);
  const getPart = (type: string): string => parts.find(p => p.type === type)?.value || '';
  return `${getPart('day')}.${getPart('month')}.${getPart('year')} ${getPart('hour')}:${getPart('minute')}`;
};

interface RefreshStationParams {
  wirePower?: number;
  batterySOC?: number;
  lastUpdateTime?: number;
}

@singleton()
export class StationService extends EventEmitter {
  private wirePower: number = 0;
  private batterySOC: number;
  private lastUpdateTime: number;
  private status: StationStatus = StationStatus.undefined;

  private prevStatus: StationStatus = StationStatus.undefined;
  private prevBatterySOC: number = 0;

  constructor(
    private readonly deyeCloudApiService: DeyeCloudApiService
  ) {
    super();
  }

  public getInfo(): string {
    const formatedTime = formatDateWithTimezone(this.lastUpdateTime);
    const statusIcon = this.status === StationStatus.undefined ? '⚪' : (this.status === StationStatus.noGrid ? '🔴' : '🟢');
    return `${statusIcon} <b>Статус:</b> ${this.status}\n${this.batterySOC > 20 ? `🔋` : `🪫`} <b>Заряд батареї:</b> ${this.batterySOC}%\n⌚ <b>Оновлено:</b> ${formatedTime}`;
  }

  private checkAndEmitEvents(): void {
    if (this.prevStatus !== StationStatus.undefined && this.status !== this.prevStatus) {
      console.log(`Event: Status changed from ${this.prevStatus} to ${this.status}`);
      this.emit('statusChange', this.status);
    }

    const LOW_BATTERY_THRESHOLD = 20;
    if (this.prevBatterySOC > LOW_BATTERY_THRESHOLD && this.batterySOC <= LOW_BATTERY_THRESHOLD) {
      console.log(`Event: Low battery detected (${this.batterySOC}%)`);
      this.emit('lowBattery', this.batterySOC);
    }
  }

  private updateStation(params: RefreshStationParams): void {
    this.prevStatus = this.status;
    this.prevBatterySOC = this.batterySOC;

    this.wirePower = params.wirePower ?? 0;
    this.batterySOC = params.batterySOC ?? 0;
    this.lastUpdateTime = params.lastUpdateTime ?? 0;

    this.refreshStatus();
    this.checkAndEmitEvents();
    return;
  }

  public async refreshStation(): Promise<void> {
    try {
      console.log(`Updating station data...`);
      const stationData = await this.deyeCloudApiService.getStationData();
      this.updateStation({
        batterySOC: stationData.batterySOC,
        lastUpdateTime: stationData.lastUpdateTime,
        wirePower: stationData.wirePower
      });
      return;
    } catch (error) {
      console.log((error as Error).message);
    }
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