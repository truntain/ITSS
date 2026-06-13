import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { Checkin } from '../checkins/entities/checkin.entity';
import { Membership } from '../memberships/entities/membership.entity';
import { Booking } from '../bookings/entities/booking.entity';
import * as bcrypt from 'bcrypt';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Checkin)
    private readonly checkinRepository: Repository<Checkin>,
    @InjectRepository(Membership)
    private readonly membershipRepository: Repository<Membership>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
  ) { }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async createMember(createMemberDto: CreateMemberDto) {
    const existing = await this.findOneByEmail(createMemberDto.email);
    if (existing) {
      throw new BadRequestException('Email đã tồn tại!');
    }

    const defaultPassword = createMemberDto.password || '123456';
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(defaultPassword, salt);

    const newMember = this.userRepository.create({
      email: createMemberDto.email,
      password: passwordHash,
      role: 'HV',
      fullName: createMemberDto.fullName,
      phone: createMemberDto.phone,
      gender: createMemberDto.gender,
      birthDate: createMemberDto.birthDate ? new Date(createMemberDto.birthDate) : undefined,
      isActive: true,
    });

    return this.userRepository.save(newMember);
  }

  async updateMember(id: number, updateMemberDto: UpdateMemberDto) {
    const member = await this.findOne(id);
    if (!member || member.role !== 'HV') {
      throw new NotFoundException('Không tìm thấy hội viên!');
    }

    if (updateMemberDto.email && updateMemberDto.email !== member.email) {
      const existing = await this.findOneByEmail(updateMemberDto.email);
      if (existing) {
        throw new BadRequestException('Email đã tồn tại!');
      }
    }

    const updateData: any = { ...updateMemberDto };
    if (updateMemberDto.password) {
      const salt = await bcrypt.genSalt();
      updateData.password = await bcrypt.hash(updateMemberDto.password, salt);
    }
    if (updateMemberDto.birthDate) {
      updateData.birthDate = new Date(updateMemberDto.birthDate);
    }

    await this.userRepository.update(id, updateData);
    return this.findOne(id);
  }

  async create(
    email: string,
    passwordHash: string,
    role: UserRole = 'HV',
    fullName: string = '',
    phone: string = '',
  ): Promise<User> {
    const newUser = this.userRepository.create({
      email,
      password: passwordHash,
      role,
      fullName,
      phone,
    });
    return this.userRepository.save(newUser);
  }

  async findOne(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findAllMembers(): Promise<User[]> {
    return this.userRepository.find({
      where: { role: 'HV', isActive: true },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        gender: true,
        birthDate: true,
      },
      order: { fullName: 'ASC' },
    });
  }

  async findAllMembersDetailed() {
    const users = await this.userRepository.find({
      where: { role: 'HV', isActive: true },
      order: { fullName: 'ASC' },
    });

    const detailedMembers: any[] = [];

    for (const user of users) {
      // Get all memberships
      const memberships = await this.membershipRepository.find({
        where: { userId: user.id },
        relations: { package: true },
        order: { endDate: 'DESC' },
      });

      // Get all checkins
      const checkins = await this.checkinRepository.find({
        where: { userId: user.id },
        order: { checkedInAt: 'DESC' },
      });

      // Get all bookings
      const bookings = await this.bookingRepository.find({
        where: { userId: user.id },
        relations: { pt: true },
        order: { date: 'DESC', timeSlot: 'DESC' },
      });

      // Find active or most recent membership
      const activeMembership = memberships.find(m => m.status === 'active') || memberships[0];

      let status: 'active' | 'expired' | 'suspended' = 'expired';
      if (activeMembership) {
        const todayStr = new Date().toISOString().split('T')[0];
        if (activeMembership.status === 'active' && activeMembership.endDate >= todayStr) {
          status = 'active';
        } else if (activeMembership.status === 'paused') {
          status = 'suspended';
        }
      }

      // Build history
      // Check-ins
      const checkinHistory = checkins.map(c => {
        const time = new Date(c.checkedInAt);
        const formattedTime = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;
        const formattedDate = new Date(c.checkedInAt).toLocaleDateString('vi-VN');
        return {
          date: formattedDate,
          action: 'Check-in',
          detail: `${formattedTime} – Buổi tập`
        };
      });

      // PT Bookings
      const ptHistory = bookings
        .filter(b => b.status === 'confirmed')
        .map(b => {
          const formattedDate = new Date(b.date).toLocaleDateString('vi-VN');
          return {
            date: formattedDate,
            action: 'PT Session',
            detail: `Buổi tập với PT ${b.pt?.fullName || 'Không rõ'}`
          };
        });

      // Membership registrations
      const membershipHistory = memberships.map(m => {
        const formattedDate = new Date(m.createdAt).toLocaleDateString('vi-VN');
        return {
          date: formattedDate,
          action: 'Đăng ký gói',
          detail: `${m.package?.name || 'Gói tập'} – Thời hạn đến ${new Date(m.endDate).toLocaleDateString('vi-VN')}`
        };
      });

      // Combine and sort history by date DESC
      const history = [...checkinHistory, ...ptHistory, ...membershipHistory].sort((a, b) => {
        const parseDate = (dStr: string) => {
          const parts = dStr.split('/');
          return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10)).getTime();
        };
        return parseDate(b.date) - parseDate(a.date);
      });

      // Last checkin
      const lastCheckinObj = checkins[0];
      const lastCheckinStr = lastCheckinObj 
        ? new Date(lastCheckinObj.checkedInAt).toLocaleDateString('vi-VN') 
        : 'Chưa check-in';

      detailedMembers.push({
        id: `HV${String(user.id).padStart(3, '0')}`,
        dbId: user.id,
        name: user.fullName,
        phone: user.phone || '',
        email: user.email || '',
        gender: user.gender === 'female' ? 'Nữ' : user.gender === 'male' ? 'Nam' : 'Khác',
        dob: user.birthDate ? new Date(user.birthDate).toLocaleDateString('vi-VN') : 'Không rõ',
        joinDate: new Date(user.createdAt).toLocaleDateString('vi-VN'),
        package: activeMembership?.package?.name || 'Chưa đăng ký',
        packageExpiry: activeMembership?.endDate ? new Date(activeMembership.endDate).toLocaleDateString('vi-VN') : 'N/A',
        status,
        ptSessions: activeMembership?.remainingSessions || 0,
        totalCheckins: checkins.length,
        lastCheckin: lastCheckinStr,
        history,
        membershipId: activeMembership?.id || null,
      });
    }

    return detailedMembers;
  }
}
