import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IssuesController } from './issues.controller';
import { IssuesService } from './issues.service';
import { Issue, User } from '../entities';

@Module({
  imports: [TypeOrmModule.forFeature([Issue, User])],
  controllers: [IssuesController],
  providers: [IssuesService],
  exports: [IssuesService],
})
export class IssuesModule {}
