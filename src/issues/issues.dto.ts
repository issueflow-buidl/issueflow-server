import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateIssueDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  body?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  labels?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  assignees?: string[];
}

export class BulkCreateIssuesDto {
  @IsString()
  @IsNotEmpty()
  owner: string;

  @IsString()
  @IsNotEmpty()
  repo: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateIssueDto)
  issues: CreateIssueDto[];
}

export class CreatedIssueDto {
  id: string;
  number: number;
  title: string;
  url: string;
  state: string;
}

export class BulkCreateIssuesResponseDto {
  success: boolean;
  created: CreatedIssueDto[];
  failed: Array<{ title: string; error: string }>;
  total: number;
  createdCount: number;
  failedCount: number;
}
