import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Issue } from '../entities';
import { User } from '../entities';
import { BulkCreateIssuesDto, BulkCreateIssuesResponseDto } from './issues.dto';

interface GitHubIssueResponse {
  id: number;
  number: number;
  title: string;
  html_url: string;
  state: string;
}

interface GitHubErrorResponse {
  message: string;
  errors?: Array<{ message: string }>;
}

@Injectable()
export class IssuesService {
  private readonly logger = new Logger(IssuesService.name);
  private readonly GITHUB_API_BASE = 'https://api.github.com';

  constructor(
    @InjectRepository(Issue)
    private issueRepository: Repository<Issue>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async bulkCreateFromMarkdown(
    dto: BulkCreateIssuesDto,
    userId: string,
  ): Promise<BulkCreateIssuesResponseDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || !user.accessToken) {
      throw new BadRequestException(
        'User not found or GitHub access token not available',
      );
    }

    const results: BulkCreateIssuesResponseDto = {
      success: true,
      created: [],
      failed: [],
      total: dto.issues.length,
      createdCount: 0,
      failedCount: 0,
    };

    for (const issue of dto.issues) {
      try {
        const githubIssue = await this.createGitHubIssue(
          dto.owner,
          dto.repo,
          issue,
          user.accessToken,
        );

        results.created.push({
          id: String(githubIssue.id),
          number: githubIssue.number,
          title: githubIssue.title,
          url: githubIssue.html_url,
          state: githubIssue.state,
        });
        results.createdCount++;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(
          `Failed to create issue "${issue.title}": ${errorMessage}`,
        );
        results.failed.push({
          title: issue.title,
          error: errorMessage,
        });
        results.failedCount++;
      }
    }

    results.success = results.failedCount === 0;
    return results;
  }

  private async createGitHubIssue(
    owner: string,
    repo: string,
    issue: {
      title: string;
      body?: string;
      labels?: string[];
      assignees?: string[];
    },
    accessToken: string,
  ): Promise<GitHubIssueResponse> {
    const url = `${this.GITHUB_API_BASE}/repos/${owner}/${repo}/issues`;

    const body: Record<string, unknown> = {
      title: issue.title,
    };

    if (issue.body) {
      body.body = issue.body;
    }

    if (issue.labels && issue.labels.length > 0) {
      body.labels = issue.labels;
    }

    if (issue.assignees && issue.assignees.length > 0) {
      body.assignees = issue.assignees;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'IssueFlow-App',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = (await response.json()) as GitHubErrorResponse;
      const errorMessage =
        errorData.message || `GitHub API error: ${response.status}`;

      if (errorData.errors && errorData.errors.length > 0) {
        const errorMessages = errorData.errors.map((e) => e.message).join(', ');
        throw new Error(`${errorMessage}: ${errorMessages}`);
      }

      throw new Error(errorMessage);
    }

    return (await response.json()) as GitHubIssueResponse;
  }
}
