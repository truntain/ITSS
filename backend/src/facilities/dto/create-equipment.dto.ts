import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsInt, IsOptional, MaxLength, IsDateString, IsIn } from 'class-validator';
import type { EquipmentStatus } from '../entities/equipment.entity';

export class CreateEquipmentDto {
  @ApiProperty({ example: 'EQ-001', description: 'Mã thiết bị độc nhất' })
  @IsNotEmpty({ message: 'Mã thiết bị không được để trống!' })
  @IsString({ message: 'Mã thiết bị phải là chuỗi ký tự!' })
  @MaxLength(50, { message: 'Mã thiết bị không được vượt quá 50 ký tự!' })
  code: string;

  @ApiProperty({ example: 'Máy chạy bộ Impulse RT700', description: 'Tên thiết bị' })
  @IsNotEmpty({ message: 'Tên thiết bị không được để trống!' })
  @IsString({ message: 'Tên thiết bị phải là chuỗi ký tự!' })
  @MaxLength(255, { message: 'Tên thiết bị không được vượt quá 255 ký tự!' })
  name: string;

  @ApiProperty({ example: 1, description: 'ID phòng tập chứa thiết bị' })
  @IsNotEmpty({ message: 'ID phòng tập không được để trống!' })
  @IsInt({ message: 'ID phòng tập phải là số nguyên!' })
  facilityId: number;

  @ApiProperty({ example: 'active', enum: ['active', 'maintenance', 'broken'], required: false })
  @IsOptional()
  @IsIn(['active', 'maintenance', 'broken'], { message: 'Trạng thái thiết bị không hợp lệ!' })
  status?: EquipmentStatus;

  @ApiProperty({ example: '2026-06-12', description: 'Ngày bảo trì gần nhất (YYYY-MM-DD)', required: false })
  @IsOptional()
  @IsDateString({}, { message: 'Ngày bảo trì không đúng định dạng YYYY-MM-DD!' })
  lastMaintenance?: string;
}
