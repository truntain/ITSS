import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  genSalt: jest.fn().mockResolvedValue('mocked_salt'),
  hash: jest.fn().mockResolvedValue('mocked_hash'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  // Mock implementation of services
  const mockUsersService = {
    findOneByEmail: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('nếu báo lỗi BadRequestException nếu thiếu email hoặc mật khẩu', async () => {
      await expect(service.register('', '123456')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.register('test@gympro.com', '')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('nếu báo lỗi BadRequestException nếu email đã tồn tại', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue({ id: 1, email: 'existed@gympro.com' });

      await expect(
        service.register('existed@gympro.com', '123456'),
      ).rejects.toThrow(BadRequestException);
      expect(usersService.findOneByEmail).toHaveBeenCalledWith('existed@gympro.com');
    });

    it('nếu đăng ký thành công, hash mật khẩu, tạo user mới và trả về token', async () => {
      // Arrange: Giả lập email chưa tồn tại và tạo user thành công
      mockUsersService.findOneByEmail.mockResolvedValue(null);
      const createdUser = {
        id: 2,
        email: 'newuser@gympro.com',
        role: 'HV',
        fullName: 'Nguyễn Văn A',
        phone: '0123456789',
        password: 'hashed_password',
      };
      mockUsersService.create.mockResolvedValue(createdUser);
      mockJwtService.sign.mockReturnValue('mock-jwt-token');

      // Act: Thực hiện đăng ký
      const result = await service.register(
        'newuser@gympro.com',
        '123456',
        'HV',
        'Nguyễn Văn A',
        '0123456789',
      );

      // Assert: Kiểm nghiệm kết quả nhận về
      expect(usersService.findOneByEmail).toHaveBeenCalledWith('newuser@gympro.com');
      expect(usersService.create).toHaveBeenCalledWith(
        'newuser@gympro.com',
        expect.any(String), // password hash
        'HV',
        'Nguyễn Văn A',
        '0123456789',
      );
      expect(jwtService.sign).toHaveBeenCalled();
      expect(result).toHaveProperty('access_token');
      expect(result.access_token).toBe('mock-jwt-token');
      expect(result.user).not.toHaveProperty('password');
      expect(result.user.email).toBe('newuser@gympro.com');
    });
  });

  describe('login', () => {
    it('nếu báo lỗi BadRequestException nếu thiếu email hoặc password', async () => {
      await expect(service.login('', '123456')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('nếu báo lỗi UnauthorizedException nếu email không tồn tại', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(null);

      await expect(
        service.login('notfound@gympro.com', '123456'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('nếu báo lỗi UnauthorizedException nếu sai mật khẩu', async () => {
      const mockUser = {
        id: 1,
        email: 'user@gympro.com',
        password: 'hashed_password',
      };
      mockUsersService.findOneByEmail.mockResolvedValue(mockUser);
      
      // Mock bcrypt compare to return false
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      await expect(service.login('user@gympro.com', 'wrong_password')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('nếu đăng nhập thành công nếu đúng mật khẩu và trả về token cùng info', async () => {
      const mockUser = {
        id: 1,
        email: 'user@gympro.com',
        password: 'hashed_password',
        role: 'HV',
        fullName: 'Hội Viên A',
      };
      mockUsersService.findOneByEmail.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('mock-jwt-token-login');
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

      const result = await service.login('user@gympro.com', '123456');

      expect(result).toEqual({
        access_token: 'mock-jwt-token-login',
        user: {
          id: 1,
          email: 'user@gympro.com',
          role: 'HV',
          fullName: 'Hội Viên A',
        },
      });
    });
  });

  describe('getProfile', () => {
    it('nếu báo lỗi BadRequestException nếu không tìm thấy người dùng', async () => {
      mockUsersService.findOne.mockResolvedValue(null);

      await expect(service.getProfile(999)).rejects.toThrow(BadRequestException);
    });

    it('nếu trả về thông tin user không chứa password', async () => {
      const mockUser = {
        id: 1,
        email: 'user@gympro.com',
        password: 'hashed_password',
        role: 'HV',
        fullName: 'Hội Viên A',
      };
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await service.getProfile(1);
      expect(result).not.toHaveProperty('password');
      expect(result.id).toBe(1);
    });
  });

  describe('changePassword', () => {
    it('nếu báo lỗi BadRequestException nếu thiếu thông tin mật khẩu cũ hoặc mới', async () => {
      await expect(service.changePassword(1, '', 'newpass')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('nếu báo lỗi BadRequestException nếu mật khẩu cũ không chính xác', async () => {
      const mockUser = {
        id: 1,
        email: 'user@gympro.com',
        password: 'hashed_password',
      };
      mockUsersService.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      await expect(
        service.changePassword(1, 'wrong_current', 'newpass'),
      ).rejects.toThrow(BadRequestException);
    });

    it('nếu thay đổi mật khẩu thành công, mã hóa mật khẩu mới và lưu vào DB', async () => {
      const mockUser = {
        id: 1,
        email: 'user@gympro.com',
        password: 'hashed_password',
      };
      mockUsersService.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
      mockUsersService.update.mockResolvedValue(mockUser);

      const result = await service.changePassword(1, 'correct_current', 'newpass');

      expect(usersService.update).toHaveBeenCalledWith(1, {
        password: expect.any(String),
      });
      expect(result).toEqual({ message: 'Đổi mật khẩu thành công' });
    });
  });
});
