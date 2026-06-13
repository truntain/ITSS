import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsInt, IsNumber, IsOptional, IsBoolean, MaxLength, Min } from 'class-validator';

export class CreatePackageDto {
  @ApiProperty({ example: 'PKG-MONTH-1', description: 'Mã gói tập độc nhất' })
  @IsNotEmpty({ message: 'Mã gói tập không được để trống!' })
  @IsString({ message: 'Mã gói tập phải là chuỗi ký tự!' })
  @MaxLength(50, { message: 'Mã gói tập không được vượt quá 50 ký tự!' })
  id: string;

  @ApiProperty({ example: 'Gói Gội viên Vàng', description: 'Tên gói tập' })
  @IsNotEmpty({ message: 'Tên gói tập không được để trống!' })
  @IsString({ message: 'Tên gói tập phải là chuỗi ký tự!' })
  @MaxLength(255, { message: 'Tên gói tập không được vượt quá 255 ký tự!' })
  name: string;

  @ApiProperty({ example: 'Member', description: 'Loại gói tập (Member, PT, Combo)' })
  @IsNotEmpty({ message: 'Loại gói tập không được để trống!' })
  @IsString({ message: 'Loại gói tập phải là chuỗi ký tự!' })
  @MaxLength(50, { message: 'Loại gói tập không được vượt quá 50 ký tự!' })
  type: string;

  @ApiProperty({ example: 6, description: 'Thời hạn gói tập (tháng)' })
  @IsNotEmpty({ message: 'Thời hạn gói tập không được để trống!' })
  @IsInt({ message: 'Thời hạn gói tập phải là số nguyên!' })
  @Min(1, { message: 'Thời hạn tối thiểu là 1 tháng!' })
  durationMonths: number;

  @ApiProperty({ example: 3000000, description: 'Đơn giá gói tập (VND)' })
  @IsNotEmpty({ message: 'Đơn giá không được để trống!' })
  @IsNumber({}, { message: 'Đơn giá phải là số!' })
  @Min(0, { message: 'Đơn giá phải lớn hơn hoặc bằng 0!' })
  price: number;

  @ApiProperty({ example: { sessions: 24, description: 'Tập tự do và 24 buổi PT' }, description: 'Quyền lợi gói tập' })
  @IsNotEmpty({ message: 'Quyền lợi không được để trống!' })
  benefits: any;

  @ApiProperty({ example: true, description: 'Hiển thị gói tập trên hệ thống', required: false })
  @IsOptional()
  @IsBoolean({ message: 'Trạng thái hiển thị phải là Boolean!' })
  isVisible?: boolean;
}
