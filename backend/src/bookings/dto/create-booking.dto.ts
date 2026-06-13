import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsInt, IsOptional, MaxLength, IsDateString } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({ example: 1, description: 'ID Hội viên đặt lịch' })
  @IsNotEmpty({ message: 'ID Hội viên không được để trống!' })
  @IsInt({ message: 'ID Hội viên phải là số nguyên!' })
  userId: number;

  @ApiProperty({ example: 2, description: 'ID PT hướng dẫn' })
  @IsNotEmpty({ message: 'ID PT không được để trống!' })
  @IsInt({ message: 'ID PT phải là số nguyên!' })
  ptId: number;

  @ApiProperty({ example: '2026-06-12', description: 'Ngày đặt lịch (YYYY-MM-DD)' })
  @IsNotEmpty({ message: 'Ngày đặt lịch không được để trống!' })
  @IsDateString({}, { message: 'Ngày đặt lịch không đúng định dạng YYYY-MM-DD!' })
  date: string;

  @ApiProperty({ example: '08:00 - 09:30', description: 'Khung giờ đặt lịch' })
  @IsNotEmpty({ message: 'Khung giờ không được để trống!' })
  @IsString({ message: 'Khung giờ phải là chuỗi ký tự!' })
  @MaxLength(50, { message: 'Khung giờ không được vượt quá 50 ký tự!' })
  timeSlot: string;

  @ApiProperty({ example: 'Phòng A1', description: 'Tên phòng tập', required: false })
  @IsOptional()
  @IsString({ message: 'Tên phòng phải là chuỗi ký tự!' })
  @MaxLength(100, { message: 'Tên phòng không được vượt quá 100 ký tự!' })
  room?: string;

  @ApiProperty({ example: 'Personal Training', description: 'Loại hình tập luyện' })
  @IsNotEmpty({ message: 'Loại hình không được để trống!' })
  @IsString({ message: 'Loại hình phải là chuỗi ký tự!' })
  @MaxLength(100, { message: 'Loại hình không được vượt quá 100 ký tự!' })
  type: string;
}
