import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Account extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  name: string;

  @Column()
  iv: string;

  @Column()
  type: string; // mnemonic, privkey, keystore

  @Column()
  secret: string;

  @Column({ default: 10 })
  addrs: number;
}
