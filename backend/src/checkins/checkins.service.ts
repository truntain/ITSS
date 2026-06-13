import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCheckinDto } from './dto/create-checkin.dto';
import { UpdateCheckinDto } from './dto/update-checkin.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Checkin } from './entities/checkin.entity';
import { MembershipsService } from '../memberships/memberships.service';

@Injectable()
export class CheckinsService {
  constructor(
    @InjectRepository(Checkin)
    private readonly checkinRepository: Repository<Checkin>,
    private readonly membershipsService: MembershipsService,
  ) {}

  async create(createCheckinDto: CreateCheckinDto) {
    const checkin = this.checkinRepository.create(createCheckinDto);
    return this.checkinRepository.save(checkin);
  }

  async findAll() {
    return this.checkinRepository.find({
      relations: { user: true, staff: true },
      order: { checkedInAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const checkin = await this.checkinRepository.findOne({
      where: { id },
      relations: { user: true, staff: true },
    });
    if (!checkin) {
      throw new NotFoundException(`Không tìm thấy ca điểm danh với ID #${id}`);
    }
    return checkin;
  }

  async update(id: number, updateCheckinDto: UpdateCheckinDto) {
    await this.findOne(id); // Check existence
    await this.checkinRepository.update(id, updateCheckinDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const checkin = await this.findOne(id);
    await this.checkinRepository.remove(checkin);
    return { message: 'Xóa ca điểm danh thành công' };
  }

  async findMyHistory(userId: number) {
    return this.checkinRepository.find({
      where: { userId },
      order: { checkedInAt: 'DESC' },
    });
  }

  async findMyStatus(userId: number) {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const todayCheckin = await this.checkinRepository.findOne({
      where: {
        userId,
        checkedInAt: Between(startOfToday, endOfToday),
      },
      order: { checkedInAt: 'DESC' },
    });

    const activeMembership = await this.membershipsService.findActiveByUserId(userId);

    const workoutCount = await this.checkinRepository.count({
      where: { userId },
    });

    return {
      todayCheckin: todayCheckin ? {
        checkedInAt: todayCheckin.checkedInAt,
        checkinMethod: todayCheckin.checkinMethod,
      } : null,
      membership: activeMembership ? {
        packageName: activeMembership.package?.name || 'N/A',
        endDate: activeMembership.endDate,
        remainingDays: Math.max(0, Math.ceil((new Date(activeMembership.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))),
        remainingSessions: activeMembership.remainingSessions,
        totalSessions: activeMembership.totalSessions,
      } : null,
      workoutCount,
    };
  }
}
