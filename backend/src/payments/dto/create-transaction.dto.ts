import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsInt, IsNumber, IsOptional, MaxLength, Min } from 'class-validator';

export class CreateTransactionDto {
  @ApiProperty({ example: 'BILL-178126591', description: 'Mã số hóa đơn giao dịch' })
  @IsNotEmpty({ message: 'Số hóa đơn không được để trống!' })
  @IsString({ message: 'Số hóa đơn phải là chuỗi ký tự!' })
  @MaxLength(100, { message: 'Số hóa đơn không được vượt quá 100 ký tự!' })
  receiptNo: string;

  @ApiProperty({ example: 1, description: 'ID Hội viên thực hiện giao dịch' })
  @IsNotEmpty({ message: 'ID người dùng không được để trống!' })
  @IsInt({ message: 'ID người dùng phải là số nguyên!' })
  userId: number;

  @ApiProperty({ example: 2, description: 'ID thông tin đăng ký hội viên' })
  @IsNotEmpty({ message: 'ID Membership không được để trống!' })
  @IsInt({ message: 'ID Membership phải là số nguyên!' })
  membershipId: number;

  @ApiProperty({ example: 'PKG-MONTH-1', description: 'Mã gói tập áp dụng' })
  @IsNotEmpty({ message: 'Mã gói tập không được để trống!' })
  @IsString({ message: 'Mã gói tập phải là chuỗi ký tự!' })
  @MaxLength(50, { message: 'Mã gói tập không được vượt quá 50 ký tự!' })
  packageId: string;

  @ApiProperty({ example: 1, description: 'ID voucher áp dụng (nếu có)', required: false })
  @IsOptional()
  @IsInt({ message: 'ID Voucher phải là số nguyên!' })
  voucherId?: number;

  @ApiProperty({ example: 3000000, description: 'Giá bán gốc gói tập' })
  @IsNotEmpty({ message: 'Giá bán gốc không được để trống!' })
  @IsNumber({}, { message: 'Giá bán gốc phải là số!' })
  @Min(0, { message: 'Giá bán gốc phải lớn hơn hoặc bằng 0!' })
  originalAmount: number;

  @ApiProperty({ example: 300000, description: 'Số tiền giảm giá (nếu có)', required: false })
  @IsOptional()
  @IsNumber({}, { message: 'Số tiền giảm giá phải là số!' })
  @Min(0, { message: 'Số tiền giảm giá phải lớn hơn hoặc bằng 0!' })
  discountAmount?: number;

  @ApiProperty({ example: 2700000, description: 'Số tiền thanh toán thực tế' })
  @IsNotEmpty({ message: 'Số tiền thanh toán không được để trống!' })
  @IsNumber({}, { message: 'Số tiền thanh toán phải là số!' })
  @Min(0, { message: 'Số tiền thanh toán phải lớn hơn hoặc bằng 0!' })
  finalAmount: number;

  @ApiProperty({ example: 'Chuyển khoản ngân hàng', description: 'Phương thức thanh toán (Tiền mặt, Chuyển khoản, Thẻ)' })
  @IsNotEmpty({ message: 'Phương thức thanh toán không được để trống!' })
  @IsString({ message: 'Phương thức thanh toán phải là chuỗi ký tự!' })
  @MaxLength(50, { message: 'Phương thức thanh toán không được vượt quá 50 ký tự!' })
  paymentMethod: string;

  @ApiProperty({ example: 3, description: 'ID nhân viên thu ngân (nếu có)', required: false })
  @IsOptional()
  @IsInt({ message: 'ID nhân viên thu ngân phải là số nguyên!' })
  cashierId?: number;
}
