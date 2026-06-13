import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkShift } from './entities/work-shift.entity';
import { User } from '../users/entities/user.entity';
import { WorkShiftsService } from './work-shifts.service';
import { WorkShiftsController } from './work-shifts.controller';

@Module({
  imports: [TypeOrmModule.forFeature([WorkShift, User])],
  controllers: [WorkShiftsController],
  providers: [WorkShiftsService],
  exports: [WorkShiftsService],
})
export class WorkShiftsModule {}
