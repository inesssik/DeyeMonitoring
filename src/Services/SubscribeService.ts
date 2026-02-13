import { DatabaseService } from "./DatabaseService.js";
import { ClientSubscribe } from "../Entities/ClientSubscribe.js";
import { SubscribeType } from "../Types/types.js";
import { singleton } from "tsyringe";

@singleton()
export class SubscribeService {
  constructor(
    private readonly databaseService: DatabaseService
  ) { }

  public async getSubscribers(typeId: SubscribeType): Promise<string[]> {
    return await this.databaseService.getSubscribedClientsByType(typeId);
  }

  public async getClientSubscribes(clientId: string): Promise<ClientSubscribe[]> {
    const dbUserSubscriptions = await this.databaseService.getUserSubscriptions(clientId);
    return dbUserSubscriptions.map(dbSub => new ClientSubscribe({
      clientId,
      status: dbSub.status,
      subscribeId: dbSub.subscribeId,
      subscribeType: dbSub.typeId
    }));
  }

  public async toggleSubscription(clientId: string, subscribeType: SubscribeType): Promise<boolean> {
    const subscriptions = await this.getClientSubscribes(clientId);
    const targetSubscription = subscriptions.find(s => s.subscribeType === subscribeType);

    const currentStatus = targetSubscription ? targetSubscription.status : false;
    const newStatus = !currentStatus;

    await this.databaseService.insertUpdateSubscribe(clientId, subscribeType, newStatus);

    return newStatus;
  }
}