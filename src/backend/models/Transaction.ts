import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export default class Transaction {
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

  @Column({ nullable: true })
  height: number;
}
