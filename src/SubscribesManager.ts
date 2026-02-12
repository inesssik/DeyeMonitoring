import Database from "./Database.js";
import ClientSubscribe from "./ClientSubscribe.js";

interface SubscribesManagerConstructor {
  database: Database;
  clientSubscribesMap: Map<string, Map<number, ClientSubscribe>>;
}

class SubscribesManager {
  private readonly database: Database;
  private clientSubscribesMap: Map<string, Map<number, ClientSubscribe>>;
  private allSubscribeTypesLength: number = Number.MAX_VALUE;

  constructor(params: SubscribesManagerConstructor) {
    this.database = params.database;
    this.clientSubscribesMap = params.clientSubscribesMap ?? new Map();
  }

  public async getClientSubscribes(clientId: string): Promise<Map<number, ClientSubscribe>> {
    const clientSubscribes = this.clientSubscribesMap.get(clientId) ?? new Map();

    if (this.allSubscribeTypesLength > clientSubscribes.size) {
      const dbUserSubscriptions = await this.database.getUserSubscriptions(clientId);

      if (this.allSubscribeTypesLength === Number.MAX_VALUE) {
        this.allSubscribeTypesLength = dbUserSubscriptions.length;
      }

      const clientSubscribeTypesMap = new Map<number, ClientSubscribe>();
      for (const dbSubscribe of dbUserSubscriptions) {
        clientSubscribeTypesMap.set(
          dbSubscribe.typeId,
          new ClientSubscribe({
            clientId,
            status: dbSubscribe.status,
            subscribeId: dbSubscribe.subscribeId,
            subscribeTypeId: dbSubscribe.typeId
          }));
      }
      this.clientSubscribesMap.set(clientId, clientSubscribeTypesMap);
    }

    return this.clientSubscribesMap.get(clientId);
  }
}

export default SubscribesManager;