import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBodyRecordDto } from './dto/create-body-record.dto';
import { UpdateBodyRecordDto } from './dto/update-body-record.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BodyRecord } from './entities/body-record.entity';

@Injectable()
export class BodyRecordsService {
  constructor(
    @InjectRepository(BodyRecord)
    private readonly bodyRecordRepository: Repository<BodyRecord>,
  ) {}

  async create(createBodyRecordDto: CreateBodyRecordDto) {
    const bodyRecord = this.bodyRecordRepository.create(createBodyRecordDto);
    return this.bodyRecordRepository.save(bodyRecord);
  }

  async findAll() {
    return this.bodyRecordRepository.find({
      relations: { user: true, pt: true },
      order: { recordedDate: 'DESC' },
    });
  }

  async findOne(id: number) {
    const bodyRecord = await this.bodyRecordRepository.findOne({
      where: { id },
      relations: { user: true, pt: true },
    });
    if (!bodyRecord) {
      throw new NotFoundException(`Không tìm thấy chỉ số cơ thể với ID #${id}`);
    }
    return bodyRecord;
  }

  async update(id: number, updateBodyRecordDto: UpdateBodyRecordDto) {
    await this.findOne(id); // Check existence
    await this.bodyRecordRepository.update(id, updateBodyRecordDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const bodyRecord = await this.findOne(id);
    await this.bodyRecordRepository.remove(bodyRecord);
    return { message: 'Xóa chỉ số cơ thể thành công' };
  }

  async findMyRecords(userId: number) {
    return this.bodyRecordRepository.find({
      where: { userId },
      order: { recordedDate: 'ASC' },
    });
  }
}
