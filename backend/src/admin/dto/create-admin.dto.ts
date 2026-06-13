import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAdminDto {
  @ApiProperty({ example: 'admin@example.com', description: 'Địa chỉ email của admin' })
  @IsNotEmpty({ message: 'Email không được để trống!' })
  @IsEmail({}, { message: 'Email không đúng định dạng!' })
  email: string;

  @ApiProperty({ example: 'password123', description: 'Mật khẩu đăng nhập' })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống!' })
  @MinLength(6, { message: 'Mật khẩu phải dài ít nhất 6 ký tự!' })
  password: string;

  @ApiProperty({ example: 'Nguyễn Quản Trị', description: 'Họ và tên' })
  @IsNotEmpty({ message: 'Họ và tên không được để trống!' })
  @IsString({ message: 'Họ và tên phải là chuỗi ký tự!' })
  fullName: string;

  @ApiProperty({ example: '0987654321', description: 'Số điện thoại' })
  @IsNotEmpty({ message: 'Số điện thoại không được để trống!' })
  @IsString({ message: 'Số điện thoại phải là chuỗi ký tự!' })
  @MaxLength(15, { message: 'Số điện thoại không được vượt quá 15 ký tự!' })
  phone: string;
}
