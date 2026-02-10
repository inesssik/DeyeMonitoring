import Database from "./DatabasePool.js";

interface SubscribesManagerConstructor {
  database: Database;
  userSubscribes: Map<string, Record<number, true>>
}

class SubscribesManager {
  private readonly database: Database;

  constructor(params: SubscribesManagerConstructor) {
    params.database = this.database;
  }

  setStatus
}

export default SubscribesManager;