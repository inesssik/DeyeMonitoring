interface ClientSubscribeConstructor {
  clientId: string;
  subscribeId: number;
  subscribeType: number;
  status: boolean;
}

export class ClientSubscribe {
  public readonly clientId: string;
  public readonly subscribeId: number;
  public readonly subscribeType: number;
  public status: boolean;

  constructor(params: ClientSubscribeConstructor) {
    this.clientId = params.clientId;
    this.subscribeId = params.subscribeId;
    this.subscribeType = params.subscribeType;
    this.status = params.status ?? false;
  }
}