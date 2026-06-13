import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength, IsEmail } from 'class-validator';

export class UpdateGymSettingDto {
  @ApiProperty({ example: 'GymPro Fitness Center', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiProperty({ example: '0281234567', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiProperty({ example: 'contact@gympro.vn', required: false })
  @IsOptional()
  @IsEmail({}, { message: 'Email không hợp lệ!' })
  email?: string;

  @ApiProperty({ example: '123 Nguyễn Huệ, Q.1, TP.HCM', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: '06:00', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  openTime?: string;

  @ApiProperty({ example: '22:00', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  closeTime?: string;

  @ApiProperty({ example: 'data:image/png;base64,...', required: false })
  @IsOptional()
  @IsString()
  logo?: string;
}
