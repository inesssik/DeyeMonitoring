import { singleton } from "tsyringe";
import axios, { AxiosInstance } from "axios";
import crypto from 'crypto';
import { ConfigService } from "./ConfigService.js";
import { GetStationDataResponse, RefreshAccessTokenResponse } from '../Types/types.js';

@singleton()
export class DeyeCloudApiService {
  private accessToken?: string;
  private expiresAt: number = 0;
  private axiosInstance: AxiosInstance;

  constructor(
    private readonly configService: ConfigService
  ) {
    this.axiosInstance = axios.create({
      baseURL: this.configService.values.BASE_URL
    });
  }

  public async init(): Promise<void> {
    this.initInterceptors();
    await this.refreshAccessToken();
    console.log("DeyeCloudApi initialized successfully.");
  }

  private initInterceptors(): void {
    this.axiosInstance.interceptors.request.use(async (config) => {
      if (config.url?.includes('/account/token')) return config;

      const isExpired = Date.now() > (this.expiresAt - 10000);
      if (!this.accessToken || isExpired) {
        await this.refreshAccessToken();
      }

      config.headers.Authorization = `bearer ${this.accessToken}`;
      return config;
    });
  }

  private async refreshAccessToken(): Promise<void> {
    const { APP_ID, APP_SECRET, EMAIL, PASSWORD } = this.configService.values;
    const sha256password = crypto.createHash('sha256').update(PASSWORD).digest('hex');

    const res = await this.axiosInstance.post<RefreshAccessTokenResponse>(
      `/account/token?appId=${APP_ID}`,
      { appSecret: APP_SECRET, email: EMAIL, password: sha256password }
    );

    if (!res.data?.accessToken) throw new Error('Failed to obtain Access Token');

    this.accessToken = res.data.accessToken;
    this.expiresAt = Date.now() + (Number(res.data.expiresIn) * 1000);
  }

  public async getStationData(): Promise<GetStationDataResponse> {
    const res = await this.axiosInstance.post<GetStationDataResponse>(
      `/station/latest`,
      { stationId: this.configService.values.STATION_ID }
    );
    return res.data;
  }
}