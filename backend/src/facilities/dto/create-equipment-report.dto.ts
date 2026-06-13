import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsInt, IsOptional, IsIn } from 'class-validator';
import type { ReportStatus } from '../entities/equipment-report.entity';

export class CreateEquipmentReportDto {
  @ApiProperty({ example: 1, description: 'ID thiết bị cần báo cáo' })
  @IsNotEmpty({ message: 'ID thiết bị không được để trống!' })
  @IsInt({ message: 'ID thiết bị phải là số nguyên!' })
  equipmentId: number;

  @ApiProperty({ example: 1, description: 'ID người báo cáo (Hội viên/Nhân viên/PT)' })
  @IsNotEmpty({ message: 'ID người báo cáo không được để trống!' })
  @IsInt({ message: 'ID người báo cáo phải là số nguyên!' })
  reporterId: number;

  @ApiProperty({ example: 'Cáp máy kéo bị sờn rách có nguy cơ đứt', description: 'Chi tiết tình trạng hỏng hóc' })
  @IsNotEmpty({ message: 'Mô tả tình trạng không được để trống!' })
  @IsString({ message: 'Mô tả tình trạng phải là chuỗi ký tự!' })
  description: string;

  @ApiProperty({ example: 'pending', enum: ['pending', 'in_progress', 'resolved'], required: false })
  @IsOptional()
  @IsIn(['pending', 'in_progress', 'resolved'], { message: 'Trạng thái báo cáo không hợp lệ!' })
  status?: ReportStatus;
}
