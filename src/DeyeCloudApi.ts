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
  stationId: string;
}

class DeyeCloudApi {
  private accessToken: string;
  private axiosInstance: Axios;
  private appId: string;
  private appSecret: string;
  private email: string;
  private password: string;
  private stationId: string;

  constructor(params: DeyeCloudApiConstructor) {
    this.accessToken = params.accessToken;
    this.appId = params.appId;
    this.appSecret = params.appSecret;
    this.email = params.email;
    this.password = params.password;
    this.axiosInstance = axios.create({ baseURL: params.baseUrl });
    this.stationId = params.stationId;
  }

  public async getStationData(): Promise<GetStationDataResponse> {
    const res = await this.axiosInstance.post<GetStationDataResponse>(`/station/latest`, {
      stationId: this.stationId
    }, { headers: { "authorization": `bearer ${this.accessToken}` } });
    return res.data;
  }

  private async refreshAccessToken(): Promise<void> {
    const sha256password = crypto.createHash('sha256').update(this.password).digest('hex');
    const res = await this.axiosInstance.post<RefreshAccessTokenResponse>(`/account/token?appId=${this.appId}`, {
      appSecret: this.appSecret,
      email: this.email,
      password: sha256password,
    });

    if (!res.data?.accessToken) throw new Error('Access Token can`t be obtained');
    this.accessToken = res.data.accessToken;
    return;
  }

  public async init(): Promise<void> {
    if (!this.accessToken) await this.refreshAccessToken();
    return;
  }
}

export default DeyeCloudApi;