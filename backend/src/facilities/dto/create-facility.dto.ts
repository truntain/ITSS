import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsInt, IsOptional, MaxLength, Min } from 'class-validator';

export class CreateFacilityDto {
  @ApiProperty({ example: 'Phòng Gym A', description: 'Tên phòng tập/khu vực' })
  @IsNotEmpty({ message: 'Tên phòng tập không được để trống!' })
  @IsString({ message: 'Tên phòng tập phải là chuỗi ký tự!' })
  @MaxLength(255, { message: 'Tên phòng tập không được vượt quá 255 ký tự!' })
  name: string;

  @ApiProperty({ example: 50, description: 'Sức chứa tối đa (người)' })
  @IsNotEmpty({ message: 'Sức chứa không được để trống!' })
  @IsInt({ message: 'Sức chứa phải là số nguyên!' })
  @Min(1, { message: 'Sức chứa tối thiểu phải là 1 người!' })
  capacity: number;

  @ApiProperty({ example: 'Khu vực tập tạ và máy cardio', description: 'Mô tả khu vực', required: false })
  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi ký tự!' })
  description?: string;
}
