import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  chainId: number;

  @Column()
  hash: string;

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
