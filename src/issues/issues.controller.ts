import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IssuesService } from './issues.service';
import { BulkCreateIssuesDto, BulkCreateIssuesResponseDto } from './issues.dto';
import { User } from '../entities';
import type { Request } from 'express';

@Controller('issues')
export class IssuesController {
  constructor(private readonly issuesService: IssuesService) {}

  @Post('bulk')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async bulkCreate(
    @Body() dto: BulkCreateIssuesDto,
    @Req() req: Request,
  ): Promise<BulkCreateIssuesResponseDto> {
    const user = req.user as User;
    return this.issuesService.bulkCreateFromMarkdown(dto, user.id);
  }
}
