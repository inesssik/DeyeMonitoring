import sql from 'mssql';
import { ISubscription } from '../Types/types.js';
import { singleton } from 'tsyringe';
import { ConfigService } from './ConfigService.js';

@singleton()
export class DatabaseService {
  private pool: sql.ConnectionPool;

  constructor(
    private readonly configService: ConfigService
  ) { }

  public async initPool(): Promise<void> {
    try {
      this.pool = await sql.connect({
        server: this.configService.values.DB_SERVER,
        user: this.configService.values.DB_USER,
        password: this.configService.values.DB_PASSWORD,
        database: this.configService.values.DB_DATABASE,
        options: { trustServerCertificate: true }
      });
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
    } catch (err) {
      console.error('Error upserting user:', err);
      throw err;
    }
  }

  public async insertUpdateSubscribe(clientId: string, subscribeType: number, status: boolean): Promise<void> {
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

  public async getUserSubscriptions(clientId: string): Promise<ISubscription[]> {
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

  public async getSubscribedClientsByType(subscribeType: number): Promise<string[]> {
    if (!this.pool) throw new Error('Pool not initialized');

    try {
      const request = this.pool.request();
      request.input('subscribeType', sql.Int, subscribeType);

      const query = `
        SELECT clientId 
        FROM dbo.Subscribes 
        WHERE subscribeType = @subscribeType AND status = 1
      `;

      const result = await request.query(query);

      return result.recordset.map((row: any) => row.clientId.toString());
    } catch (err) {
      console.error('Error getting subscribed clients:', err);
      return [];
    }
  }
}