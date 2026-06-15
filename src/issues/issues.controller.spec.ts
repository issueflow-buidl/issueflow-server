import { Test, TestingModule } from '@nestjs/testing';
import { IssuesController } from './issues.controller';
import { IssuesService } from './issues.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../entities';
import type { Request } from 'express';

describe('IssuesController', () => {
  let controller: IssuesController;

  const mockUser = {
    id: 'test-user-id',
    githubId: '12345',
    username: 'testuser',
    email: 'test@example.com',
    accessToken: 'mock-github-token',
  } as User;

  const mockBulkCreateResult = {
    success: true,
    created: [
      {
        id: '123',
        number: 1,
        title: 'Test Issue',
        url: 'https://github.com/test/test/issues/1',
        state: 'open',
      },
    ],
    failed: [],
    total: 1,
    createdCount: 1,
    failedCount: 0,
  };

  const mockIssuesService = {
    bulkCreateFromMarkdown: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IssuesController],
      providers: [
        {
          provide: IssuesService,
          useValue: mockIssuesService,
        },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<IssuesController>(IssuesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('bulkCreate', () => {
    it('should call service.bulkCreateFromMarkdown with correct parameters', async () => {
      const dto = {
        owner: 'testowner',
        repo: 'testrepo',
        issues: [{ title: 'Test Issue' }],
      };

      mockIssuesService.bulkCreateFromMarkdown.mockResolvedValue(
        mockBulkCreateResult,
      );

      const result = await controller.bulkCreate(dto, {
        user: mockUser,
      } as unknown as Request);

      expect(mockIssuesService.bulkCreateFromMarkdown).toHaveBeenCalledWith(
        dto,
        mockUser.id,
      );
      expect(result).toEqual(mockBulkCreateResult);
    });
  });
});
