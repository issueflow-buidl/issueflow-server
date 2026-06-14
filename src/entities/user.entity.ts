import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Issue } from './issue.entity';
import { Bounty } from './bounty.entity';
import { Repository } from './repository.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  githubId: string;

  @Column()
  username: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ nullable: true })
  accessToken: string;

  @OneToMany(() => Repository, (repository) => repository.owner)
  repositories: Repository[];

  @OneToMany(() => Issue, (issue) => issue.author)
  issues: Issue[];

  @OneToMany(() => Bounty, (bounty) => bounty.creator)
  createdBounties: Bounty[];

  @OneToMany(() => Bounty, (bounty) => bounty.claimer)
  claimedBounties: Bounty[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
