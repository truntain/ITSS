import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback } from './entities/feedback.entity';

@Injectable()
export class FeedbacksService {
  constructor(
    @InjectRepository(Feedback)
    private readonly feedbackRepository: Repository<Feedback>,
  ) {}

  async create(createFeedbackDto: CreateFeedbackDto) {
    const feedback = this.feedbackRepository.create(createFeedbackDto);
    return this.feedbackRepository.save(feedback);
  }

  async findAll() {
    return this.feedbackRepository.find({
      relations: { user: true, replier: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const feedback = await this.feedbackRepository.findOne({
      where: { id },
      relations: { user: true, replier: true },
    });
    if (!feedback) {
      throw new NotFoundException(`Không tìm thấy phản hồi với ID #${id}`);
    }
    return feedback;
  }

  async update(id: number, updateFeedbackDto: UpdateFeedbackDto) {
    await this.findOne(id); // Check existence
    
    const updateData: any = { ...updateFeedbackDto };
    if (updateFeedbackDto.replyContent || updateFeedbackDto.status === 'responded') {
      updateData.repliedAt = new Date();
    }

    await this.feedbackRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number) {
    const feedback = await this.findOne(id);
    await this.feedbackRepository.remove(feedback);
    return { message: 'Xóa phản hồi thành công' };
  }
}
