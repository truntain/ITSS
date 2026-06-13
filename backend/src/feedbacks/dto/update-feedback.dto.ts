import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateFeedbackDto } from './create-feedback.dto';
import { IsOptional, IsString, IsInt, IsIn } from 'class-validator';
import type { FeedbackStatus } from '../entities/feedback.entity';

export class UpdateFeedbackDto extends PartialType(CreateFeedbackDto) {
  @ApiProperty({ example: 'Đã tiếp nhận ý kiến của bạn, chúng tôi sẽ dọn dẹp ngay', description: 'Nội dung phản hồi từ ban quản lý/nhân viên', required: false })
  @IsOptional()
  @IsString({ message: 'Nội dung phản hồi phải là chuỗi ký tự!' })
  replyContent?: string;

  @ApiProperty({ example: 3, description: 'ID Nhân viên trả lời phản hồi', required: false })
  @IsOptional()
  @IsInt({ message: 'ID người trả lời phải là số nguyên!' })
  replierId?: number;

  @ApiProperty({ example: 'responded', enum: ['pending', 'responded'], required: false })
  @IsOptional()
  @IsIn(['pending', 'responded'], { message: 'Trạng thái phản hồi không hợp lệ!' })
  status?: FeedbackStatus;
}
