import * as fs from 'fs';
import * as path from 'path';

import { Connection, Repository, createConnection } from 'typeorm';

import Key from '../models/Key';
import Transaction from '../models/Transaction';
import WCSession from '../models/WCSession';
import { app } from 'electron';

const prod = process.env.NODE_ENV === 'production';

export class DBMan {
  private _connection: Connection;
  private _txRepo: Repository<Transaction>;
  private _wcSessionRepo: Repository<WCSession>;
  private _keyRepo: Repository<Key>;
  private _dbPath = '';

  async init() {
    if (this._connection) return;

    const userData = app.getPath('userData');
    const dbPath = path.join(userData, prod ? 'data/app.db' : 'data/dev-app.db');
    this._dbPath = dbPath;

    this._connection = await createConnection({
      type: 'better-sqlite3',
      database: dbPath,
      entities: [Transaction, WCSession, Key],
      synchronize: true,
      logging: false,
    });

    this._txRepo = this._connection.getRepository(Transaction);
    this._wcSessionRepo = this._connection.getRepository(WCSession);
    this._keyRepo = this._connection.getRepository(Key);
  }

  async clean() {
    await this._connection?.close();
    this._connection = undefined;
    this._txRepo = undefined;
    this._wcSessionRepo = undefined;
    this._keyRepo = undefined;
    fs.unlinkSync(this._dbPath);
  }

  get txRepo() {
    return this._txRepo;
  }

  get wcsessionRepo() {
    return this._wcSessionRepo;
  }

  get accountRepo() {
    return this._keyRepo;
  }
}

export default new DBMan();
