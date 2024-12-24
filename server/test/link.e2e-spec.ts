import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { LinkController } from 'src/link/link.controller';
import { LinkService } from 'src/link/link.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';

describe('LinkController', () => {
  let controller: LinkController;
  let service: LinkService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LinkController],
      providers: [
        {
          provide: LinkService,
          useValue: {
            createLink: jest.fn(),
            createPublicLink: jest.fn(),
            clickLink: jest.fn(),
            getUserLinks: jest.fn(),
            deleteLink: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({
        canActivate: jest.fn().mockReturnValue(true),
      })
      .compile();

    controller = module.get<LinkController>(LinkController);
    service = module.get<LinkService>(LinkService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new link', async () => {
      const orgLink = 'http://example.com';
      const userId = 'user123';
      const result = { orgLink, shortLink: 'http://localhost/abc123', userId };

      jest.spyOn(service, 'createLink').mockResolvedValue(result as any);

      expect(
        await controller.create({ orgLink }, { user: { _id: userId } }),
      ).toBe(result);
    });

    it('should throw BadRequestException for invalid URL', async () => {
      const orgLink = 'invalid-url';
      const userId = 'user123';

      jest.spyOn(service, 'createLink').mockImplementation(() => {
        throw new BadRequestException('Invalid URL format');
      });

      await expect(
        controller.create({ orgLink }, { user: { _id: userId } }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('createPublicLink', () => {
    it('should create a new public link', async () => {
      const orgLink = 'http://example.com';
      const result = { orgLink, shortLink: 'http://localhost/abc123' };

      jest.spyOn(service, 'createPublicLink').mockResolvedValue(result as any);

      expect(await controller.createPublicLink({ orgLink })).toBe(result);
    });

    it('should throw BadRequestException for invalid URL', async () => {
      const orgLink = 'invalid-url';

      jest.spyOn(service, 'createPublicLink').mockImplementation(() => {
        throw new BadRequestException('Invalid URL format');
      });

      await expect(controller.createPublicLink({ orgLink })).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getLink', () => {
    it('should return the original link', async () => {
      const id = 'link123';
      const orgLink = 'http://example.com';

      jest.spyOn(service, 'clickLink').mockResolvedValue(orgLink);

      expect(await controller.getLink({ id })).toBe(orgLink);
    });

    it('should throw NotFoundException if link not found', async () => {
      const id = 'link123';

      jest.spyOn(service, 'clickLink').mockResolvedValue(null);

      await expect(controller.getLink({ id })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getLinks', () => {
    it('should return a list of user links', async () => {
      const userId = 'user123';
      const result = [
        {
          orgLink: 'http://example.com',
          shortLink: 'http://localhost/abc123',
          userId,
        },
      ];

      jest.spyOn(service, 'getUserLinks').mockResolvedValue(result as any);

      expect(await controller.getLinks({ user: { _id: userId } })).toBe(result);
    });
  });

  describe('deleteLink', () => {
    it('should delete a link', async () => {
      const id = 'link123';

      jest.spyOn(service, 'deleteLink').mockResolvedValue(null);

      await controller.deleteLink(id);

      expect(service.deleteLink).toHaveBeenCalledWith(id);
    });
  });
});
