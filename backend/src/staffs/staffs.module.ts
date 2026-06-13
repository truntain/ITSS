import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffsService } from './staffs.service';
import { StaffsController } from './staffs.controller';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [StaffsController],
  providers: [StaffsService],
})
export class StaffsModule {}
