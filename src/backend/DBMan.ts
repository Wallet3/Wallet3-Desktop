import * as fs from 'fs';
import * as path from 'path';

import { Connection, Repository, createConnection } from 'typeorm';

import Transaction from './models/Transaction';
import WCSession from './models/WCSession';
import { app } from 'electron';

export class DBMan {
  private _connection: Connection;
  private _txRepo: Repository<Transaction>;
  private _wcSessionRepo: Repository<WCSession>;
  private _dbPath = '';

  async init() {
    if (this._connection) return;

    const userData = app.getPath('userData');
    const dbPath = path.join(userData, 'data/app.db');
    this._dbPath = dbPath;

    this._connection = await createConnection({
      type: 'sqlite',
      database: dbPath,
      entities: [Transaction, WCSession],
      synchronize: true,
      logging: false,
    });

    this._txRepo = this._connection.getRepository(Transaction);
    this._wcSessionRepo = this._connection.getRepository(WCSession);
  }

  async clean() {
    await this._connection?.close();
    this._connection = undefined;
    this._txRepo = undefined;
    this._wcSessionRepo = undefined;
    fs.unlinkSync(this._dbPath);
  }

  get txRepo() {
    return this._txRepo;
  }

  get wcsessionRepo() {
    return this._wcSessionRepo;
  }
}

export default new DBMan();
