import sql from 'mssql';
import { ISubscription } from './Types/types.js';

class Database {
  private pool: sql.ConnectionPool;

  constructor() { }

  public async initPool(sqlConfig: sql.config): Promise<void> {
    try {
      this.pool = await sql.connect(sqlConfig);
      console.log('Connected to MSSQL');
    } catch (err) {
      console.error('Database connection failed:', err);
      throw err;
    }
  }

  public async insertUpdateUser(tgId: number | bigint, username: string): Promise<void> {
    if (!this.pool) throw new Error('Pool not initialized');

    try {
      const request = this.pool.request();

      request.input('id', sql.BigInt, tgId);
      request.input('tgUsername', sql.VarChar, username);

      await request.execute('Clients_Upsert');

      console.log(`User ${tgId} upserted successfully.`);
    } catch (err) {
      console.error('Error upserting user:', err);
      throw err;
    }
  }

  public async insertUpdateSubscribe(clientId: number | bigint, subscribeType: number, status: boolean): Promise<void> {
    if (!this.pool) throw new Error('Pool not initialized');

    try {
      const request = this.pool.request();

      request.input('clientId', sql.BigInt, clientId);
      request.input('subscribeType', sql.Int, subscribeType);
      request.input('status', sql.Bit, status);

      await request.execute('Subscribes_Upsert');

      console.log(`Subscription for client ${clientId} (Type: ${subscribeType}) updated to ${status}.`);
    } catch (err) {
      console.error('Error upserting subscription:', err);
      throw err;
    }
  }

  public async getUserSubscriptions(clientId: number | bigint): Promise<ISubscription[]> {
    if (!this.pool) throw new Error('Pool not initialized');

    try {
      const request = this.pool.request();
      request.input('clientId', sql.BigInt, clientId);

      const result = await request.execute('dbo.Subscribes_GetAndSync');

      return result.recordset as ISubscription[];
    } catch (err) {
      console.error('Error getting subscriptions:', err);
      throw err;
    }
  }
}

export default Database;