import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IssuesService } from './issues.service';
import { Issue } from '../entities';
import { User } from '../entities';
import { BadRequestException } from '@nestjs/common';

describe('IssuesService', () => {
  let service: IssuesService;
  let userRepository: Repository<User>;

  const mockUser = {
    id: 'test-user-id',
    githubId: '12345',
    username: 'testuser',
    email: 'test@example.com',
    accessToken: 'mock-github-token',
  } as User;

  const mockIssueRepository = () => ({
    create: jest.fn(),
    save: jest.fn(),
  });

  const mockUserRepository = () => ({
    findOne: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IssuesService,
        {
          provide: getRepositoryToken(Issue),
          useFactory: mockIssueRepository,
        },
        {
          provide: getRepositoryToken(User),
          useFactory: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<IssuesService>(IssuesService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('bulkCreateFromMarkdown', () => {
    it('should throw error when user not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.bulkCreateFromMarkdown(
          {
            owner: 'testowner',
            repo: 'testrepo',
            issues: [{ title: 'Test Issue' }],
          },
          'non-existent-user',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw error when user has no access token', async () => {
      const userWithoutToken = { ...mockUser, accessToken: null } as User;
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(userWithoutToken);

      await expect(
        service.bulkCreateFromMarkdown(
          {
            owner: 'testowner',
            repo: 'testrepo',
            issues: [{ title: 'Test Issue' }],
          },
          'test-user-id',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
