import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail, IsString, IsOptional, IsDateString, IsIn, MaxLength } from 'class-validator';
import type { UserGender } from '../entities/user.entity';

export class CreateMemberDto {
  @ApiProperty({ example: 'member@example.com', description: 'Email hội viên' })
  @IsNotEmpty({ message: 'Email không được để trống!' })
  @IsEmail({}, { message: 'Email không đúng định dạng!' })
  @MaxLength(255)
  email: string;

  @ApiProperty({ example: '123456', description: 'Mật khẩu hội viên', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  password?: string;

  @ApiProperty({ example: 'Nguyễn Văn A', description: 'Họ và tên' })
  @IsNotEmpty({ message: 'Họ và tên không được để trống!' })
  @IsString()
  @MaxLength(255)
  fullName: string;

  @ApiProperty({ example: '0987654321', description: 'Số điện thoại' })
  @IsNotEmpty({ message: 'Số điện thoại không được để trống!' })
  @IsString()
  @MaxLength(15)
  phone: string;

  @ApiProperty({ example: 'male', enum: ['male', 'female', 'other'], required: false })
  @IsOptional()
  @IsIn(['male', 'female', 'other'], { message: 'Giới tính không hợp lệ!' })
  gender?: UserGender;

  @ApiProperty({ example: '1995-03-15', description: 'Ngày sinh (YYYY-MM-DD)', required: false })
  @IsOptional()
  @IsDateString({}, { message: 'Ngày sinh không đúng định dạng YYYY-MM-DD!' })
  birthDate?: string;
}
