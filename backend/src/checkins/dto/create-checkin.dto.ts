import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCheckinDto {
  @ApiProperty({ example: 1, description: 'ID Hội viên check-in' })
  @IsNotEmpty({ message: 'ID Hội viên không được để trống!' })
  @IsInt({ message: 'ID Hội viên phải là số nguyên!' })
  userId: number;

  @ApiProperty({ example: 3, description: 'ID Nhân viên xác nhận check-in (nếu có)', required: false })
  @IsOptional()
  @IsInt({ message: 'ID Nhân viên phải là số nguyên!' })
  checkedInBy?: number;

  @ApiProperty({ example: 'QR_member', description: 'Phương thức check-in (QR_member, Fingerprint, Card)' })
  @IsNotEmpty({ message: 'Phương thức check-in không được để trống!' })
  @IsString({ message: 'Phương thức check-in phải là chuỗi ký tự!' })
  @MaxLength(50, { message: 'Phương thức check-in không được vượt quá 50 ký tự!' })
  checkinMethod: string;
}
