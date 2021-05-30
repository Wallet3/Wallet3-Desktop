import { BaseEntity, Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity({})
export default class WCSession extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  session: string;

  @Column()
  userChainId: number;

  @Column()
  lastUsedTimestamp: number;
}
