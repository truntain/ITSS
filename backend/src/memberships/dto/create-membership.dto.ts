import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, IsString, IsOptional, IsDateString, IsIn, MaxLength } from 'class-validator';
import type { MembershipStatus } from '../entities/membership.entity';

export class CreateMembershipDto {
  @ApiProperty({ example: 1, description: 'ID Hội viên sở hữu gói tập' })
  @IsNotEmpty({ message: 'ID Hội viên không được để trống!' })
  @IsInt({ message: 'ID Hội viên phải là số nguyên!' })
  userId: number;

  @ApiProperty({ example: 'PKG-MONTH-1', description: 'Mã gói tập đăng ký' })
  @IsNotEmpty({ message: 'ID gói tập không được để trống!' })
  @IsString({ message: 'ID gói tập phải là chuỗi ký tự!' })
  @MaxLength(50, { message: 'ID gói tập không được vượt quá 50 ký tự!' })
  packageId: string;

  @ApiProperty({ example: '2026-06-12', description: 'Ngày bắt đầu kích hoạt (YYYY-MM-DD)' })
  @IsNotEmpty({ message: 'Ngày bắt đầu không được để trống!' })
  @IsDateString({}, { message: 'Ngày bắt đầu không đúng định dạng YYYY-MM-DD!' })
  startDate: string;

  @ApiProperty({ example: '2026-12-12', description: 'Ngày hết hạn gói (YYYY-MM-DD)' })
  @IsNotEmpty({ message: 'Ngày kết thúc không được để trống!' })
  @IsDateString({}, { message: 'Ngày kết thúc không đúng định dạng YYYY-MM-DD!' })
  endDate: string;

  @ApiProperty({ example: 24, description: 'Tổng số buổi tập (nếu có)', required: false })
  @IsOptional()
  @IsInt({ message: 'Tổng số buổi phải là số nguyên!' })
  totalSessions?: number;

  @ApiProperty({ example: 24, description: 'Số buổi tập còn lại (nếu có)', required: false })
  @IsOptional()
  @IsInt({ message: 'Số buổi còn lại phải là số nguyên!' })
  remainingSessions?: number;

  @ApiProperty({ example: 'active', enum: ['active', 'expired', 'paused'], required: false })
  @IsOptional()
  @IsIn(['active', 'expired', 'paused'], { message: 'Trạng thái gói không hợp lệ!' })
  status?: MembershipStatus;
}
