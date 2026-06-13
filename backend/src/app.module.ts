import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DataSource } from 'typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { StaffsModule } from './staffs/staffs.module';
import { TrainersModule } from './trainers/trainers.module';
import { AdminModule } from './admin/admin.module';
import { WorkShiftsModule } from './work-shifts/work-shifts.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { BookingsModule } from './bookings/bookings.module';
import { BodyRecordsModule } from './body-records/body-records.module';
import { CheckinsModule } from './checkins/checkins.module';
import { FacilitiesModule } from './facilities/facilities.module';
import { FeedbacksModule } from './feedbacks/feedbacks.module';
import { MembershipsModule } from './memberships/memberships.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    // 1. Nạp file .env toàn cục
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // 2. Cấu hình kết nối TypeORM bất đồng bộ sử dụng ConfigService
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: String(configService.get<any>('DB_PASSWORD') ?? ''),
        database: configService.get<string>('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false, // Tự động đồng bộ các bảng (Entity) vào DB (Tắt khi lên Production)
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    StaffsModule,
    TrainersModule,
    AdminModule,
    WorkShiftsModule,
    AnnouncementsModule,
    BookingsModule,
    BodyRecordsModule,
    CheckinsModule,
    FacilitiesModule,
    FeedbacksModule,
    MembershipsModule,
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  private readonly logger = new Logger('Database');

  constructor(private readonly dataSource: DataSource) { }

  onModuleInit() {
    if (this.dataSource.isInitialized) {
      this.logger.log('Kết nối đến cơ sở dữ liệu PostgreSQL thành công!');
    } else {
      this.logger.error('Kết nối đến cơ sở dữ liệu PostgreSQL thất bại!');
    }
  }
}