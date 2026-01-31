import { TZDate } from "@date-fns/tz";
import { format } from 'date-fns';
import { StationStatus } from "./Types/types.js";

const StationStatusesInfo = {
  0: ''
}

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
    return `${this.status === StationStatus.noGrid ? '🏙' : '🌇'} Статус: ${this.status}\n${this.batterySOC > 20 ? `🔋` : `🪫`} Заряд батареї: ${this.batterySOC}%\n⌚ Оновлено: ${format(new TZDate(this.lastUpdateTime * 1000, 'Europe/Kyiv'), 'dd.MM.yyyy HH:mm')}`;
  }

  public updateStation(params: RefreshStationParams): void {
    this.wirePower = params.wirePower ?? 0;
    this.batterySOC = params.batterySOC ?? 0;
    this.lastUpdateTime = params.lastUpdateTime ?? 0;
    this.refreshStatus();
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

/*
WITHOUT ELECTRICITY:

station data:
{
  code: '1000000',
  msg: 'success',
  success: true,
  requestId: '943907c2cbdcb4ae',
  generationPower: 0,
  consumptionPower: 828,
  gridPower: null,
  purchasePower: null,
  wirePower: 0,
  chargePower: null,
  dischargePower: 760,
  batteryPower: 760,
  batterySOC: 64,
  irradiateIntensity: null,
  lastUpdateTime: 1769867789
}

station list:
{
  code: '1000000',
  msg: 'success',
  success: true,
  requestId: '1b03e351ad075e98',
  total: 1,
  stationList: [
    {
      id: 61810325,
      name: 'Dan30',
      locationLat: 50.49746140630156,
      locationLng: 30.43844399788894,
      locationAddress: '30',
      regionNationId: 232,
      regionTimezone: 'Asia/Beirut',
      gridInterconnectionType: 'BATTERY_BACKUP',
      installedCapacity: 30,
      startOperatingTime: 1769300541,
      createdDate: 1769300608,
      batterySOC: 64,
      connectionStatus: 'NORMAL',
      generationPower: 0,
      lastUpdateTime: 1769867789,
      contactPhone: '',
      ownerName: null
    }
  ]
}
*/