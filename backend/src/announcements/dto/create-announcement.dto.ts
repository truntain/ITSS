import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, IsInt } from 'class-validator';

export class CreateAnnouncementDto {
  @ApiProperty({ example: 'Thông báo nghỉ lễ', description: 'Tiêu đề thông báo' })
  @IsNotEmpty({ message: 'Tiêu đề không được để trống!' })
  @IsString({ message: 'Tiêu đề phải là chuỗi ký tự!' })
  @MaxLength(255, { message: 'Tiêu đề không được vượt quá 255 ký tự!' })
  title: string;

  @ApiProperty({ example: 'Phòng tập sẽ nghỉ lễ vào ngày...', description: 'Nội dung thông báo' })
  @IsNotEmpty({ message: 'Nội dung không được để trống!' })
  @IsString({ message: 'Nội dung phải là chuỗi ký tự!' })
  content: string;

  @ApiProperty({ example: 1, description: 'ID người viết thông báo' })
  @IsNotEmpty({ message: 'ID tác giả không được để trống!' })
  @IsInt({ message: 'ID tác giả phải là số nguyên!' })
  authorId: number;
}
