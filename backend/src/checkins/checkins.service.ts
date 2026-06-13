import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateCheckinDto } from './dto/create-checkin.dto';
import { UpdateCheckinDto } from './dto/update-checkin.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Checkin } from './entities/checkin.entity';
import { MembershipsService } from '../memberships/memberships.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class CheckinsService {
  constructor(
    @InjectRepository(Checkin)
    private readonly checkinRepository: Repository<Checkin>,
    private readonly membershipsService: MembershipsService,
    private readonly usersService: UsersService,
  ) {}

  async create(createCheckinDto: CreateCheckinDto) {
    const checkin = this.checkinRepository.create(createCheckinDto);
    return this.checkinRepository.save(checkin);
  }

  async findAll(date?: string) {
    const where: any = {};
    if (date) {
      const startOfDate = new Date(date);
      startOfDate.setHours(0, 0, 0, 0);
      const endOfDate = new Date(date);
      endOfDate.setHours(23, 59, 59, 999);
      where.checkedInAt = Between(startOfDate, endOfDate);
    }
    return this.checkinRepository.find({
      where,
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

  async verifyMemberCheckin(idOrCode: string) {
    let userId = parseInt(idOrCode, 10);
    if (isNaN(userId)) {
      const clean = idOrCode.toUpperCase().replace('HV', '');
      userId = parseInt(clean, 10);
    }

    if (isNaN(userId)) {
      throw new BadRequestException('Mã hội viên không hợp lệ!');
    }

    const user = await this.usersService.findOne(userId);
    if (!user || user.role !== 'HV') {
      throw new NotFoundException('Không tìm thấy hội viên!');
    }

    const membership = await this.membershipsService.findMostRecentByUserId(userId);
    if (!membership) {
      return {
        id: user.id,
        name: user.fullName,
        avatar: user.fullName.split(' ').slice(-1)[0][0] || '?',
        phone: user.phone,
        package: 'Chưa đăng ký gói tập',
        status: 'expired',
        daysLeft: 0,
      };
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const isExpired = membership.status !== 'active' || todayStr > membership.endDate;

    const daysLeft = isExpired
      ? 0
      : Math.max(0, Math.ceil((new Date(membership.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

    return {
      id: user.id,
      name: user.fullName,
      avatar: user.fullName.split(' ').slice(-1)[0][0] || '?',
      phone: user.phone,
      package: membership.package?.name || 'N/A',
      status: isExpired ? 'expired' : 'valid',
      daysLeft,
    };
  }

  async getTodayStats() {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const todayCheckins = await this.checkinRepository.find({
      where: {
        checkedInAt: Between(startOfToday, endOfToday),
      },
    });

    let morningCount = 0;
    let afternoonCount = 0;

    for (const checkin of todayCheckins) {
      const time = new Date(checkin.checkedInAt);
      const hours = time.getHours();
      if (hours >= 6 && hours < 14) {
        morningCount++;
      } else if (hours >= 14 && hours < 22) {
        afternoonCount++;
      }
    }

    return {
      morning: { count: morningCount, max: 60 },
      afternoon: { count: afternoonCount, max: 60 },
    };
  }
}
