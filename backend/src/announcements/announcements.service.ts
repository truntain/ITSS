import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Announcement } from './entities/announcement.entity';

@Injectable()
export class AnnouncementsService {
  constructor(
    @InjectRepository(Announcement)
    private readonly announcementRepository: Repository<Announcement>,
  ) {}

  async create(createAnnouncementDto: CreateAnnouncementDto) {
    const announcement = this.announcementRepository.create(createAnnouncementDto);
    return this.announcementRepository.save(announcement);
  }

  async findAll() {
    return this.announcementRepository.find({
      relations: { author: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const announcement = await this.announcementRepository.findOne({
      where: { id },
      relations: { author: true },
    });
    if (!announcement) {
      throw new NotFoundException(`Không tìm thấy thông báo với ID #${id}`);
    }
    return announcement;
  }

  async update(id: number, updateAnnouncementDto: UpdateAnnouncementDto) {
    await this.findOne(id); // Check existence
    await this.announcementRepository.update(id, updateAnnouncementDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const announcement = await this.findOne(id);
    await this.announcementRepository.remove(announcement);
    return { message: 'Xóa thông báo thành công' };
  }
}
