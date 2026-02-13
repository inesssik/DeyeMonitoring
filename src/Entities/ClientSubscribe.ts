interface ClientSubscribeConstructor {
  clientId: string;
  subscribeId: number;
  subscribeTypeId: number;
  status: boolean;
}

export class ClientSubscribe {
  public readonly clientId: string;
  public readonly subscribeId: number;
  public readonly subscribeTypeId: number;
  public status: boolean;

  constructor(params: ClientSubscribeConstructor) {
    this.clientId = params.clientId;
    this.subscribeId = params.subscribeId;
    this.subscribeTypeId = params.subscribeTypeId;
    this.status = params.status ?? false;
  }
}