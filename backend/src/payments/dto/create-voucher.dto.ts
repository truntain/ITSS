import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsInt, IsNumber, IsOptional, IsDateString, IsIn, MaxLength, Min } from 'class-validator';
import type { VoucherDiscountType, VoucherStatus } from '../entities/voucher.entity';

export class CreateVoucherDto {
  @ApiProperty({ example: 'SUMMER50', description: 'Mã voucher' })
  @IsNotEmpty({ message: 'Mã voucher không được để trống!' })
  @IsString({ message: 'Mã voucher phải là chuỗi ký tự!' })
  @MaxLength(50, { message: 'Mã voucher không được vượt quá 50 ký tự!' })
  code: string;

  @ApiProperty({ example: 'percent', enum: ['percent', 'fixed'], description: 'Loại giảm giá (phần trăm hoặc tiền mặt)' })
  @IsNotEmpty({ message: 'Loại giảm giá không được để trống!' })
  @IsIn(['percent', 'fixed'], { message: 'Loại giảm giá không hợp lệ!' })
  discountType: VoucherDiscountType;

  @ApiProperty({ example: 10, description: 'Giá trị giảm giá (ví dụ: 10 cho 10%, 100000 cho 100k)' })
  @IsNotEmpty({ message: 'Giá trị giảm giá không được để trống!' })
  @IsNumber({}, { message: 'Giá trị giảm giá phải là số!' })
  @Min(0, { message: 'Giá trị giảm giá phải lớn hơn hoặc bằng 0!' })
  discountValue: number;

  @ApiProperty({ example: 100, description: 'Tổng số lượt sử dụng tối đa' })
  @IsNotEmpty({ message: 'Tổng số lượt sử dụng không được để trống!' })
  @IsInt({ message: 'Tổng số lượt sử dụng phải là số nguyên!' })
  @Min(1, { message: 'Tổng số lượng tối thiểu là 1!' })
  total: number;

  @ApiProperty({ example: 0, description: 'Số lượng đã sử dụng', required: false })
  @IsOptional()
  @IsInt({ message: 'Số lượng đã sử dụng phải là số nguyên!' })
  used?: number;

  @ApiProperty({ example: '2026-06-12', description: 'Ngày bắt đầu áp dụng (YYYY-MM-DD)' })
  @IsNotEmpty({ message: 'Ngày bắt đầu không được để trống!' })
  @IsDateString({}, { message: 'Ngày bắt đầu không đúng định dạng YYYY-MM-DD!' })
  startDate: string;

  @ApiProperty({ example: '2026-08-12', description: 'Ngày hết hạn voucher (YYYY-MM-DD)' })
  @IsNotEmpty({ message: 'Ngày hết hạn không được để trống!' })
  @IsDateString({}, { message: 'Ngày hết hạn không đúng định dạng YYYY-MM-DD!' })
  endDate: string;

  @ApiProperty({ example: 'active', enum: ['active', 'expired', 'depleted'], required: false })
  @IsOptional()
  @IsIn(['active', 'expired', 'depleted'], { message: 'Trạng thái voucher không hợp lệ!' })
  status?: VoucherStatus;
}
