export type RefreshAccessTokenResponse = {
  code: string,
  msg: string,
  success: false,
  requestId: string,
  accessToken: string,
  expiresIn: string,
  scope: string,
  uid: number
}

export type GetStationDataResponse = {
  code: string;
  msg: string;
  success: boolean;
  requestId: string;
  generationPower: number;
  consumptionPower: number;
  gridPower: number;
  purchasePower: number;
  wirePower: number;
  chargePower: number;
  dischargePower: number;
  batteryPower: number;
  batterySOC: number;
  irradiateIntensity: number;
  lastUpdateTime: number;
}

export type GetStationListResponse = {
  code: string;
  msg: string;
  success: boolean;
  requestId: string;
  total: number;
  stationList: {
    id: number;
    name: string;
    locationLat: number;
    locationLng: number;
    locationAddress: string;
    regionNationId: number;
    regionTimezone: string;
    gridInterconnectionType: string;
    installedCapacity: number;
    startOperatingTime: number;
    createdDate: number;
    batterySOC: number;
    connectionStatus: string;
    generationPower: number;
    lastUpdateTime: number;
    contactPhone: string;
    ownerName: string;
  }[];
}