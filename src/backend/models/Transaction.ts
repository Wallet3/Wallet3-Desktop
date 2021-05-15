import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
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
