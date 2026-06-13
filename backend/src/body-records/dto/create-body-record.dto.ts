import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, IsNumber, IsOptional, IsString, IsDateString } from 'class-validator';

export class CreateBodyRecordDto {
  @ApiProperty({ example: 1, description: 'ID Hội viên' })
  @IsNotEmpty({ message: 'ID Hội viên không được để trống!' })
  @IsInt({ message: 'ID Hội viên phải là số nguyên!' })
  userId: number;

  @ApiProperty({ example: 2, description: 'ID PT ghi nhận (nếu có)', required: false })
  @IsOptional()
  @IsInt({ message: 'ID PT phải là số nguyên!' })
  ptId?: number;

  @ApiProperty({ example: 70.5, description: 'Cân nặng (kg)' })
  @IsNotEmpty({ message: 'Cân nặng không được để trống!' })
  @IsNumber({}, { message: 'Cân nặng phải là số!' })
  weight: number;

  @ApiProperty({ example: 15.2, description: 'Tỷ lệ mỡ (%)' })
  @IsNotEmpty({ message: 'Tỷ lệ mỡ không được để trống!' })
  @IsNumber({}, { message: 'Tỷ lệ mỡ phải là số!' })
  bodyFat: number;

  @ApiProperty({ example: 35.8, description: 'Khối lượng cơ (kg)', required: false })
  @IsOptional()
  @IsNumber({}, { message: 'Khối lượng cơ phải là số!' })
  muscleMass?: number;

  @ApiProperty({ example: '2026-06-12', description: 'Ngày ghi nhận (YYYY-MM-DD)' })
  @IsNotEmpty({ message: 'Ngày ghi nhận không được để trống!' })
  @IsDateString({}, { message: 'Ngày ghi nhận không đúng định dạng YYYY-MM-DD!' })
  recordedDate: string;

  @ApiProperty({ example: 'Tập luyện tốt, cơ bắp phát triển', description: 'Ghi chú thêm', required: false })
  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi ký tự!' })
  notes?: string;
}
