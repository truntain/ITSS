import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength, IsOptional, IsString, MaxLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com', description: 'Địa chỉ email của người dùng' })
  @IsNotEmpty({ message: 'Email không được để trống!' })
  @IsEmail({}, { message: 'Email không đúng định dạng!' })
  email: string;

  @ApiProperty({ example: 'password123', description: 'Mật khẩu đăng nhập' })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống!' })
  @MinLength(6, { message: 'Mật khẩu phải dài ít nhất 6 ký tự!' })
  password: string;

  @ApiProperty({ example: 'Nguyễn Văn A', description: 'Họ và tên', required: false })
  @IsOptional()
  @IsString({ message: 'Họ và tên phải là chuỗi ký tự!' })
  fullName?: string;

  @ApiProperty({ example: '0987654321', description: 'Số điện thoại', required: false })
  @IsOptional()
  @IsString({ message: 'Số điện thoại phải là chuỗi ký tự!' })
  @MaxLength(15, { message: 'Số điện thoại không được vượt quá 15 ký tự!' })
  phone?: string;
}
