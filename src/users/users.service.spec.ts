import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  const mockUsersRepository = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: 'UsersRepository',
          useValue: mockUsersRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createUserDto = {
      name: 'Jhon Doe',
      email: 'teste@email.com',
      password: 'Password_123',
    };

    it('Should create a new user if email does not exists', async () => {
      mockUsersRepository.findByEmail.mockResolvedValue(null);
      mockUsersRepository.create.mockResolvedValue({ id: 1, ...createUserDto });

      const result = await service.create(createUserDto);

      expect(result).toHaveProperty('id');
      expect(mockUsersRepository.findByEmail).toHaveBeenCalledWith(
        createUserDto.email,
      );
      expect(mockUsersRepository.create).toHaveBeenCalledWith(createUserDto);
    });

    it('Should throw a ConflictException if email already exists', async () => {
      mockUsersRepository.findByEmail.mockResolvedValue({
        id: 1,
        email: 'teste@email.com',
      });

      await expect(service.create(createUserDto)).rejects.toBeInstanceOf(
        ConflictException,
      );

      expect(mockUsersRepository.create).not.toHaveBeenCalled();
    });
  });
});
