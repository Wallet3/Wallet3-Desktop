import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'transactions' })
export default class Transaction extends BaseEntity {
  @PrimaryColumn()
  hash: string;

  @Column()
  chainId: number;

  @Column()
  from: string;

  @Column()
  to: string;

  @Column()
  value: string;

  @Column()
  gas: number;

  @Column()
  gasPrice: number;

  @Column({ default: 0 })
  tipPrice: number;

  @Column()
  nonce: number;

  @Column('text')
  data: string;

  @Column()
  timestamp: number;

  @Column({ nullable: true })
  blockNumber: number;

  @Column({ nullable: true })
  blockHash: string;

  @Column({ nullable: true })
  status: boolean;

  @Column({ nullable: true })
  transactionIndex: number;

  @Column({ nullable: true })
  gasUsed: number;
}

export interface ITransaction {
  hash: string;

  chainId: number;

  from: string;

  to: string;

  value: string;

  gas: number;

  gasPrice: number;

  tipPrice: number;

  nonce: number;

  data: string;

  timestamp: number;

  blockNumber: number;

  blockHash: string;

  status: boolean;

  transactionIndex: number;

  gasUsed: number;
}
