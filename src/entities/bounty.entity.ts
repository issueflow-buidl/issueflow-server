import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Issue } from './issue.entity';

export enum BountyStatus {
  OPEN = 'open',
  FUNDED = 'funded',
  CLAIMED = 'claimed',
  PAID = 'paid',
  CANCELLED = 'cancelled',
}

@Entity('bounties')
export class Bounty {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  amount: number;

  @Column({ default: 'ETH' })
  tokenSymbol: string;

  @Column({ nullable: true })
  tokenAddress: string;

  @Column({
    type: 'enum',
    enum: BountyStatus,
    default: BountyStatus.OPEN,
  })
  status: BountyStatus;

  @Column({ nullable: true })
  transactionHash: string;

  @Column()
  issueId: string;

  @OneToOne(() => Issue, (issue) => issue.bounty)
  @JoinColumn({ name: 'issueId' })
  issue: Issue;

  @Column()
  creatorId: string;

  @ManyToOne(() => User, (user) => user.createdBounties)
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  @Column({ nullable: true })
  claimerId: string;

  @ManyToOne(() => User, (user) => user.claimedBounties, { nullable: true })
  @JoinColumn({ name: 'claimerId' })
  claimer: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
