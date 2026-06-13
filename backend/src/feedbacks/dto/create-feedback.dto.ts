import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, IsString } from 'class-validator';

export class CreateFeedbackDto {
  @ApiProperty({ example: 1, description: 'ID Hội viên gửi phản hồi' })
  @IsNotEmpty({ message: 'ID Hội viên không được để trống!' })
  @IsInt({ message: 'ID Hội viên phải là số nguyên!' })
  userId: number;

  @ApiProperty({ example: 'Phòng tắm ở khu B hơi bẩn, cần dọn dẹp vệ sinh', description: 'Nội dung phản hồi' })
  @IsNotEmpty({ message: 'Nội dung phản hồi không được để trống!' })
  @IsString({ message: 'Nội dung phản hồi phải là chuỗi ký tự!' })
  content: string;
}
