import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, IsString, IsOptional, Min, Max } from 'class-validator';

export class CreatePtRatingDto {
  @ApiProperty({ example: 1, description: 'ID học viên chấm điểm' })
  @IsNotEmpty({ message: 'ID học viên không được để trống!' })
  @IsInt({ message: 'ID học viên phải là số nguyên!' })
  userId: number;

  @ApiProperty({ example: 2, description: 'ID huấn luyện viên được chấm điểm' })
  @IsNotEmpty({ message: 'ID PT không được để trống!' })
  @IsInt({ message: 'ID PT phải là số nguyên!' })
  ptId: number;

  @ApiProperty({ example: 5, description: 'Số sao đánh giá (1-5)' })
  @IsNotEmpty({ message: 'Số sao không được để trống!' })
  @IsInt({ message: 'Số sao phải là số nguyên!' })
  @Min(1, { message: 'Số sao tối thiểu là 1!' })
  @Max(5, { message: 'Số sao tối đa là 5!' })
  rating: number;

  @ApiProperty({ example: 'PT nhiệt tình, chuyên nghiệp', description: 'Nhận xét/góp ý', required: false })
  @IsOptional()
  @IsString({ message: 'Nhận xét phải là chuỗi ký tự!' })
  comment?: string;
}
