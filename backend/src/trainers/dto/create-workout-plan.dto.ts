import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateWorkoutPlanDto {
  @ApiProperty({ example: 2, description: 'ID huấn luyện viên lên giáo án' })
  @IsNotEmpty({ message: 'ID PT không được để trống!' })
  @IsInt({ message: 'ID PT phải là số nguyên!' })
  ptId: number;

  @ApiProperty({ example: 1, description: 'ID học viên tập theo giáo án' })
  @IsNotEmpty({ message: 'ID học viên không được để trống!' })
  @IsInt({ message: 'ID học viên phải là số nguyên!' })
  traineeId: number;

  @ApiProperty({ example: 'Giáo án giảm mỡ bụng tháng 6', description: 'Tên giáo án bài tập' })
  @IsNotEmpty({ message: 'Tên giáo án không được để trống!' })
  @IsString({ message: 'Tên giáo án phải là chuỗi ký tự!' })
  name: string;

  @ApiProperty({ example: 'Tập trung các bài cardio cường độ cao', description: 'Mô tả chi tiết', required: false })
  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi ký tự!' })
  description?: string;

  @ApiProperty({ example: { Monday: ['Cardio 30 mins', 'Plank 3 sets'], Wednesday: ['Squats 4 sets', 'Push-ups 4 sets'] }, description: 'Chi tiết các bài tập' })
  @IsNotEmpty({ message: 'Danh sách bài tập không được để trống!' })
  exercises: any;

  @ApiProperty({ example: '2026-06-12', description: 'Ngày giao giáo án (YYYY-MM-DD)' })
  @IsNotEmpty({ message: 'Ngày giao giáo án không được để trống!' })
  @IsDateString({}, { message: 'Ngày giao giáo án không đúng định dạng YYYY-MM-DD!' })
  assignedDate: string;
}
