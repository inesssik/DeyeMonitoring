import { Database } from "./Database.js";
import { ClientSubscribe } from "./ClientSubscribe.js";
import { SubscribeType } from "./Types/types.js";
import { singleton } from "tsyringe";

@singleton()
export class SubscribeService {
  constructor(
    private readonly database: Database
  ) { }

  public async getSubscribers(typeId: SubscribeType): Promise<string[]> {
    return await this.database.getSubscribedClientsByType(typeId);
  }

  public async getClientSubscribes(clientId: string): Promise<ClientSubscribe[]> {
    const dbUserSubscriptions = await this.database.getUserSubscriptions(clientId);

    return dbUserSubscriptions.map(dbSub => new ClientSubscribe({
      clientId,
      status: dbSub.status,
      subscribeId: dbSub.subscribeId,
      subscribeTypeId: dbSub.typeId,
    }));
  }

  public async toggleSubscription(clientId: string, typeId: SubscribeType): Promise<boolean> {
    const subscriptions = await this.getClientSubscribes(clientId);
    const targetSubscription = subscriptions.find(s => s.subscribeTypeId === typeId);

    const currentStatus = targetSubscription ? targetSubscription.status : false;
    const newStatus = !currentStatus;

    await this.database.insertUpdateSubscribe(clientId, typeId, newStatus);

    return newStatus;
  }
}