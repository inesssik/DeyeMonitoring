import Database from "./DatabasePool.js";

interface SubscribesManagerConstructor {
  database: Database;
}

class SubscribesManager {
  private readonly database: Database;

  constructor(params: SubscribesManagerConstructor) {
    params.database = this.database;
  }


}

export default SubscribesManager;