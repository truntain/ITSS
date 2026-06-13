import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateEquipmentReportDto } from './create-equipment-report.dto';
import { IsOptional, IsDateString } from 'class-validator';

export class UpdateEquipmentReportDto extends PartialType(CreateEquipmentReportDto) {
  @ApiProperty({ example: '2026-06-12 18:00:00', description: 'Ngày xử lý xong báo cáo (YYYY-MM-DD HH:mm:ss)', required: false })
  @IsOptional()
  @IsDateString({}, { message: 'Ngày giải quyết không đúng định dạng!' })
  resolvedAt?: Date;
}
