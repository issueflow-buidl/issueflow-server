import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Issue } from './issue.entity';

@Entity('repositories')
export class Repository {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  githubId: string;

  @Column()
  name: string;

  @Column()
  fullName: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  url: string;

  @Column({ default: false })
  isPrivate: boolean;

  @Column()
  ownerId: string;

  @ManyToOne(() => User, (user) => user.repositories)
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @OneToMany(() => Issue, (issue) => issue.repository)
  issues: Issue[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
