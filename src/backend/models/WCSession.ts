import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({})
export default class WCSession extends BaseEntity {
  @PrimaryColumn()
  topicId: string;

  @Column({ type: 'text' })
  session: string;

  @Column()
  chainId: number;

  @Column()
  lastUsedTimestamp: number;
}
