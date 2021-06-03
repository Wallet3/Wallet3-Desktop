import { BaseEntity, Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'dapps' })
export default class WCSession extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'simple-json' })
  session: IWcSession;

  @Column()
  userChainId: number;

  @Column()
  lastUsedTimestamp: number;

  @Column()
  keyId: number;
}
