import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, IsString, IsDateString, Min, Max } from 'class-validator';

export class CreatePtEvaluationDto {
  @ApiProperty({ example: 2, description: 'ID huấn luyện viên' })
  @IsNotEmpty({ message: 'ID PT không được để trống!' })
  @IsInt({ message: 'ID PT phải là số nguyên!' })
  ptId: number;

  @ApiProperty({ example: 1, description: 'ID học viên' })
  @IsNotEmpty({ message: 'ID học viên không được để trống!' })
  @IsInt({ message: 'ID học viên phải là số nguyên!' })
  traineeId: number;

  @ApiProperty({ example: 8, description: 'Điểm đánh giá (1-10)' })
  @IsNotEmpty({ message: 'Điểm đánh giá không được để trống!' })
  @IsInt({ message: 'Điểm đánh giá phải là số nguyên!' })
  @Min(1, { message: 'Điểm đánh giá tối thiểu là 1!' })
  @Max(10, { message: 'Điểm đánh giá tối đa là 10!' })
  score: number;

  @ApiProperty({ example: 'Tiến bộ tốt, tập trung cao độ', description: 'Nội dung nhận xét' })
  @IsNotEmpty({ message: 'Nội dung nhận xét không được để trống!' })
  @IsString({ message: 'Nội dung nhận xét phải là chuỗi ký tự!' })
  content: string;

  @ApiProperty({ example: '2026-06-12', description: 'Ngày đánh giá (YYYY-MM-DD)' })
  @IsNotEmpty({ message: 'Ngày đánh giá không được để trống!' })
  @IsDateString({}, { message: 'Ngày đánh giá không đúng định dạng YYYY-MM-DD!' })
  evaluationDate: string;
}
