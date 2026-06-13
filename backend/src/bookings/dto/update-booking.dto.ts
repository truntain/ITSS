import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateBookingDto } from './create-booking.dto';
import { IsOptional, IsIn } from 'class-validator';
import type { BookingStatus, AttendanceStatus } from '../entities/booking.entity';

export class UpdateBookingDto extends PartialType(CreateBookingDto) {
  @ApiProperty({ example: 'confirmed', enum: ['pending', 'confirmed', 'cancelled'], required: false })
  @IsOptional()
  @IsIn(['pending', 'confirmed', 'cancelled'], { message: 'Trạng thái đặt lịch không hợp lệ!' })
  status?: BookingStatus;

  @ApiProperty({ example: 'checked_in', enum: ['none', 'checked_in', 'absent'], required: false })
  @IsOptional()
  @IsIn(['none', 'checked_in', 'absent'], { message: 'Trạng thái điểm danh không hợp lệ!' })
  attendanceStatus?: AttendanceStatus;
}
