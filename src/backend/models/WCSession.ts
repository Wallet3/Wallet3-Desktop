import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'dapps' })
export default class WCSession extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'simple-json' })
  session: IRawWcSession;

  @Column()
  userChainId: number;

  @Column()
  lastUsedTimestamp: number;

  @Column()
  keyId: number;
}
