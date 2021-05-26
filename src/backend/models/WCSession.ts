import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({})
export default class WCSession extends BaseEntity {
  @PrimaryColumn()
  topicId: string;

  @Column({ type: 'text' })
  session: string;

  @Column()
  userChainId: number;

  @Column()
  lastUsedTimestamp: number;
}
