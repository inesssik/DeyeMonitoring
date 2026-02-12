import Database from "./Database.js";

interface ClientSubscribeConstructor {
  clientId: string;
  subscribeId: number;
  subscribeTypeId: number;
  status: boolean;
}

class ClientSubscribe {
  private readonly database: Database;

  private clientId: string;
  private subscribeId: number;
  private subscribeTypeId: number;
  public status: boolean;

  constructor(params: ClientSubscribeConstructor) {
    this.clientId = params.clientId;
    this.subscribeId = params.subscribeId;
    this.subscribeTypeId = params.subscribeTypeId;
    this.status = params.status ?? false;
  }

  public async switchStatus(): Promise<boolean> {
    await this.database.insertUpdateSubscribe(this.clientId, this.subscribeTypeId, !this.status);
    this.status = !this.status;
    return this.status;
  }
}

export default ClientSubscribe;