import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, IsString, IsOptional } from 'class-validator';

export class CheckoutDto {
  @ApiProperty({ example: 1, description: 'ID Hội viên thực hiện giao dịch' })
  @IsNotEmpty({ message: 'ID Hội viên không được để trống!' })
  @IsInt({ message: 'ID Hội viên phải là số nguyên!' })
  userId: number;

  @ApiProperty({ example: 'PKG-MONTH-1', description: 'Mã gói tập áp dụng' })
  @IsNotEmpty({ message: 'Mã gói tập không được để trống!' })
  @IsString({ message: 'Mã gói tập phải là chuỗi ký tự!' })
  packageId: string;

  @ApiProperty({ example: 'WELCOME10', description: 'Mã voucher áp dụng (nếu có)', required: false })
  @IsOptional()
  @IsString({ message: 'Mã voucher phải là chuỗi!' })
  voucherCode?: string;

  @ApiProperty({ example: 'cash', description: 'Phương thức thanh toán (cash, card, transfer)' })
  @IsNotEmpty({ message: 'Phương thức thanh toán không được để trống!' })
  @IsString({ message: 'Phương thức thanh toán phải là chuỗi ký tự!' })
  paymentMethod: string;
}
