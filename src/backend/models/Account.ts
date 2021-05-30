import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export default class Account extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  iv: string;

  @Column({ nullable: true })
  type: number; // mnemonic, privkey, keystore

  @Column()
  salt: string;

  @Column({ nullable: true })
  secret: string;

  @Column({ default: 10 })
  addrs: number;

  @Column({ default: `m/44''/60''/0''/0`, type: 'text' })
  basePath: string;

  @Column({ default: 0 })
  basePathIndex: number;
}

export enum AccountType {
  mnemonic = 0,
  privkey = 1,
  keystore = 2,
}
