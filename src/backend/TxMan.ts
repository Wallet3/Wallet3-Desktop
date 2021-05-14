import * as path from 'path';

import { Connection, FindConditions, Repository, createConnection } from 'typeorm';

import Transaction from './models/Transaction';
import { app } from 'electron';

class TxMan {
  #connection: Connection;
  #txRepo: Repository<Transaction>;

  async init() {
    if (this.#connection) return;
    
    const userData = app.getPath('userData');
    const dbPath = path.join(userData, 'data/app.sqlite');

    this.#connection = await createConnection({
      type: 'sqlite',
      database: dbPath,
      entities: [Transaction],
      synchronize: true,
      logging: false,
    });

    this.#txRepo = this.#connection.getRepository(Transaction);
  }

  async findTxs(conditions: FindConditions<Transaction>) {
    return await this.#txRepo.find(conditions);
  }

  async save(tx: Transaction) {
    return await this.#txRepo.save(tx);
  }
}

export default new TxMan();
