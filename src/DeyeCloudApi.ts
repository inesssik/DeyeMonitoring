import axios, { Axios } from "axios";
import crypto from 'crypto';
import { GetStationDataResponse, RefreshAccessTokenResponse } from './Types/types.js';

interface DeyeCloudApiConstructor {
  baseUrl: string;
  appId: string;
  appSecret: string;
  email: string;
  password: string;
  accessToken?: string;
  accessTokenExpiresInMs?: number;
  stationId: string;
}

class DeyeCloudApi {
  private accessToken: string;
  private accessTokenExpiresInMs: number;
  private axiosInstance: Axios;
  private appId: string;
  private appSecret: string;
  private email: string;
  private password: string;
  private stationId: string;

  constructor(params: DeyeCloudApiConstructor) {
    this.accessToken = params.accessToken;
    this.accessTokenExpiresInMs = params.accessTokenExpiresInMs ?? 0;
    this.appId = params.appId;
    this.appSecret = params.appSecret;
    this.email = params.email;
    this.password = params.password;
    this.axiosInstance = axios.create({ baseURL: params.baseUrl });
    this.stationId = params.stationId;
  }

  private initInterceptors(): void {
    this.axiosInstance.interceptors.request.use(async (config) => {
      if (config.url.includes('/account/token')) {
        return config;
      }

      const isTokenExpired = Date.now() > (this.accessTokenExpiresInMs - 10000);

      if (!this.accessToken || isTokenExpired) {
        await this.refreshAccessToken();
      }

      if (this.accessToken) {
        config.headers.Authorization = `bearer ${this.accessToken}`;
      };

      return config;
    }, (error) => Promise.reject(error));
  }

  public async getStationData(): Promise<GetStationDataResponse> {
    const res = await this.axiosInstance.post<GetStationDataResponse>(`/station/latest`, { stationId: this.stationId });
    return res.data;
  }

  private async refreshAccessToken(): Promise<void> {
    const sha256password = crypto.createHash('sha256').update(this.password).digest('hex');
    const res = await this.axiosInstance.post<RefreshAccessTokenResponse>(`/account/token?appId=${this.appId}`, {
      appSecret: this.appSecret,
      email: this.email,
      password: sha256password,
    });

    console.log(res.headers);
    console.log(res.config);
    console.log(res.data);

    if (!res.data?.accessToken) throw new Error('Access Token can`t be obtained');
    this.accessTokenExpiresInMs = Date.now() + (+res.data.expiresIn * 1000);
    this.accessToken = res.data.accessToken;
    return;
  }

  public async init(): Promise<void> {
    this.initInterceptors();
    return;
  }
}

export default DeyeCloudApi;