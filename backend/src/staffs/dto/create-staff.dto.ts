import { IsEmail, IsNotEmpty, IsString, IsIn } from 'class-validator';

export class CreateStaffDto {
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  @IsIn(['Quản lý', 'PT', 'Lễ tân'])
  role: 'Quản lý' | 'PT' | 'Lễ tân';
}
