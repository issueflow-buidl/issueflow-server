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
import { Repository } from './repository.entity';
import { Bounty } from './bounty.entity';

export enum IssueStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  CLOSED = 'closed',
}

@Entity('issues')
export class Issue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  githubId: string;

  @Column()
  number: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  body: string;

  @Column({
    type: 'enum',
    enum: IssueStatus,
    default: IssueStatus.OPEN,
  })
  status: IssueStatus;

  @Column({ nullable: true })
  url: string;

  @Column()
  repositoryId: string;

  @ManyToOne(() => Repository, (repository) => repository.issues)
  @JoinColumn({ name: 'repositoryId' })
  repository: Repository;

  @Column()
  authorId: string;

  @ManyToOne(() => User, (user) => user.issues)
  @JoinColumn({ name: 'authorId' })
  author: User;

  @OneToOne(() => Bounty, (bounty) => bounty.issue)
  bounty: Bounty;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
