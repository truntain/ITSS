import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, BadRequestException } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { DataSource } from 'typeorm';
import { User } from './../src/users/entities/user.entity';

// Thiết lập timeout dài hơn (60 giây) cho quá trình kéo và dựng Docker container
jest.setTimeout(60000);

describe('Auth System (e2e)', () => {
  let app: INestApplication;
  let pgContainer: StartedPostgreSqlContainer;
  let dataSource: DataSource;

  beforeAll(async () => {
    // 1. Khởi chạy một PostgreSQL container cô lập trên Docker
    pgContainer = await new PostgreSqlContainer('postgres:15-alpine')
      .withDatabase('Gympro_Test')
      .withUsername('test_user')
      .withPassword('test_password')
      .start();

    // 2. Ghi đè biến môi trường để AppModule kết nối tới Test DB trong Container
    process.env.DB_HOST = pgContainer.getHost();
    process.env.DB_PORT = pgContainer.getMappedPort(5432).toString();
    process.env.DB_USERNAME = pgContainer.getUsername();
    process.env.DB_PASSWORD = pgContainer.getPassword();
    process.env.DB_NAME = pgContainer.getDatabase();

    // 3. Khởi dựng NestJS AppModule
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // 4. Lấy DataSource và đồng bộ (Synchronize) schema tự động tạo các bảng
    dataSource = app.get(DataSource);
    await dataSource.synchronize();
  });

  afterAll(async () => {
    // Đóng NestJS app và dừng Docker container sau khi tất cả các test hoàn tất
    if (app) {
      await app.close();
    }
    if (pgContainer) {
      await pgContainer.stop();
    }
  });

  describe('Đăng ký tài khoản (POST /auth/register)', () => {
    it('nếu đăng ký tài khoản thành công và trả về thông tin user kèm JWT token', async () => {
      const registerPayload = {
        email: 'e2e_user@gympro.com',
        password: 'Gympro@123',
        fullName: 'Người Dùng E2E',
        phone: '0901234567',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerPayload)
        .expect(201);

      expect(response.body).toEqual({ message: 'Đăng ký thành công' });

      // Khẳng định dữ liệu đã được lưu chính xác trong database PostgreSQL của container
      const userRepository = dataSource.getRepository(User);
      const dbUser = await userRepository.findOne({
        where: { email: registerPayload.email },
      });
      expect(dbUser).not.toBeNull();
      expect(dbUser?.fullName).toBe(registerPayload.fullName);
      expect(dbUser?.phone).toBe(registerPayload.phone);
    });

    it('nếu báo lỗi khi đăng ký với email đã tồn tại', async () => {
      const duplicatePayload = {
        email: 'e2e_user@gympro.com', // Email đã được tạo ở test trước
        password: 'Gympro@456',
        fullName: 'Trùng Lặp',
        phone: '0907654321',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(duplicatePayload)
        .expect(400);

      expect(response.body.message).toContain('Email đã tồn tại!');
    });
  });

  describe('Đăng nhập tài khoản (POST /auth/login)', () => {
    it('nếu đăng nhập thành công nếu đúng thông tin credentials', async () => {
      const loginPayload = {
        email: 'e2e_user@gympro.com',
        password: 'Gympro@123',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginPayload)
        .expect(201);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body.user.email).toBe(loginPayload.email);
    });

    it('nếu báo lỗi 401 khi đăng nhập sai mật khẩu', async () => {
      const invalidPayload = {
        email: 'e2e_user@gympro.com',
        password: 'Wrong@123',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(invalidPayload)
        .expect(401);

      expect(response.body.message).toContain('không hợp lệ');
    });
  });
});
