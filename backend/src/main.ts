import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  // Tăng giới hạn payload để hỗ trợ ảnh base64 lớn
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  // Kích hoạt Validation toàn cục
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Tự động loại bỏ các thuộc tính không được định nghĩa trong DTO
    transform: true, // Tự động chuyển đổi kiểu dữ liệu sang DTO instance tương ứng
  }));

  const config = new DocumentBuilder()
    .setTitle('Gympro API')
    .setDescription('Gympro backend API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  Logger.log(`Ứng dụng Backend đang chạy tại: http://localhost:${port}`, 'Bootstrap');
  Logger.log(`Tài liệu Swagger API: http://localhost:${port}/api`, 'Bootstrap');
}
bootstrap();
