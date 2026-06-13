import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual } from 'typeorm';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { User } from '../users/entities/user.entity';
import { Transaction } from '../payments/entities/transaction.entity';
import { Membership } from '../memberships/entities/membership.entity';
import { Checkin } from '../checkins/entities/checkin.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Membership)
    private readonly membershipRepository: Repository<Membership>,
    @InjectRepository(Checkin)
    private readonly checkinRepository: Repository<Checkin>,
  ) {}

  async create(dto: CreateAdminDto) {
    const existing = await this.userRepository.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new BadRequestException('Email đã tồn tại!');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    const newAdmin = this.userRepository.create({
      email: dto.email,
      password: hashedPassword,
      fullName: dto.fullName,
      phone: dto.phone,
      role: 'AD',
    });

    const saved = await this.userRepository.save(newAdmin);
    const { password: _, ...adminWithoutPassword } = saved;
    return adminWithoutPassword;
  }

  async findAll() {
    return this.userRepository.find({
      where: { role: 'AD' },
      select: { id: true, email: true, fullName: true, phone: true, isActive: true, createdAt: true, updatedAt: true },
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number) {
    const admin = await this.userRepository.findOne({
      where: { id, role: 'AD' },
      select: { id: true, email: true, fullName: true, phone: true, isActive: true, createdAt: true, updatedAt: true },
    });
    if (!admin) {
      throw new NotFoundException(`Không tìm thấy quản trị viên với ID #${id}`);
    }
    return admin;
  }

  async update(id: number, dto: UpdateAdminDto) {
    const admin = await this.findOne(id);

    const updateData: any = { ...dto };
    if (dto.password) {
      const salt = await bcrypt.genSalt();
      updateData.password = await bcrypt.hash(dto.password, salt);
    }

    await this.userRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number) {
    const admin = await this.findOne(id);
    await this.userRepository.remove(admin);
    return { message: 'Xóa quản trị viên thành công' };
  }

  async getDashboardSummary() {
    const now = new Date();
    
    // Boundaries for this month and last month
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    
    // --- Card 1: Total Revenue ---
    // 1. All-time revenue
    const allTimeRevenueResult = await this.transactionRepository
      .createQueryBuilder('t')
      .select('SUM(t.final_amount)', 'sum')
      .getRawOne();
    const allTimeRevenue = parseFloat(allTimeRevenueResult?.sum || '0');

    // 2. This month revenue
    const thisMonthRevenueResult = await this.transactionRepository
      .createQueryBuilder('t')
      .select('SUM(t.final_amount)', 'sum')
      .where('t.transaction_date >= :start', { start: startOfThisMonth })
      .getRawOne();
    const thisMonthRevenue = parseFloat(thisMonthRevenueResult?.sum || '0');

    // 3. Last month revenue
    const lastMonthRevenueResult = await this.transactionRepository
      .createQueryBuilder('t')
      .select('SUM(t.final_amount)', 'sum')
      .where('t.transaction_date >= :start AND t.transaction_date <= :end', { start: startOfLastMonth, end: endOfLastMonth })
      .getRawOne();
    const lastMonthRevenue = parseFloat(lastMonthRevenueResult?.sum || '0');

    let revenueGrowth = 0;
    if (lastMonthRevenue > 0) {
      revenueGrowth = ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
    } else if (thisMonthRevenue > 0) {
      revenueGrowth = 100;
    }

    // --- Card 2: New Members ---
    const thisMonthNewMembers = await this.userRepository.count({
      where: {
        role: 'HV',
        createdAt: MoreThanOrEqual(startOfThisMonth),
      }
    });

    const lastMonthNewMembers = await this.userRepository.count({
      where: {
        role: 'HV',
        createdAt: Between(startOfLastMonth, endOfLastMonth),
      }
    });

    let membersGrowth = 0;
    if (lastMonthNewMembers > 0) {
      membersGrowth = ((thisMonthNewMembers - lastMonthNewMembers) / lastMonthNewMembers) * 100;
    } else if (thisMonthNewMembers > 0) {
      membersGrowth = 100;
    }

    // --- Card 3: Active Members ---
    const activeMembersCount = await this.membershipRepository.count({
      where: { status: 'active' }
    });

    const thisMonthActiveCreated = await this.membershipRepository.count({
      where: {
        status: 'active',
        createdAt: MoreThanOrEqual(startOfThisMonth),
      }
    });

    const lastMonthActiveCreated = await this.membershipRepository.count({
      where: {
        status: 'active',
        createdAt: Between(startOfLastMonth, endOfLastMonth),
      }
    });

    let activeGrowth = 0;
    if (lastMonthActiveCreated > 0) {
      activeGrowth = ((thisMonthActiveCreated - lastMonthActiveCreated) / lastMonthActiveCreated) * 100;
    } else if (thisMonthActiveCreated > 0) {
      activeGrowth = 100;
    }

    // --- Card 4: Expiring Memberships ---
    const todayStr = now.toISOString().split('T')[0];
    const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const next7DaysStr = next7Days.toISOString().split('T')[0];
    
    const prev7DaysStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const prev7DaysStartStr = prev7DaysStart.toISOString().split('T')[0];
    const prev7DaysEnd = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
    const prev7DaysEndStr = prev7DaysEnd.toISOString().split('T')[0];

    const expiringCount = await this.membershipRepository.count({
      where: {
        status: 'active',
        endDate: Between(todayStr, next7DaysStr) as any
      }
    });

    const prevExpiringCount = await this.membershipRepository.count({
      where: {
        endDate: Between(prev7DaysStartStr, prev7DaysEndStr) as any
      }
    });

    let expiringGrowth = 0;
    if (prevExpiringCount > 0) {
      expiringGrowth = ((expiringCount - prevExpiringCount) / prevExpiringCount) * 100;
    } else if (expiringCount > 0) {
      expiringGrowth = 100;
    }

    // --- Chart 1: Member Growth (Last 12 Months) ---
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const newUsers = await this.userRepository.find({
      where: {
        role: 'HV',
        createdAt: MoreThanOrEqual(twelveMonthsAgo),
      },
      select: {
        createdAt: true,
      }
    });

    const memberGrowthData: any[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth();
      const monthLabel = `T${month + 1}`;
      
      const count = newUsers.filter(u => {
        const uDate = new Date(u.createdAt);
        return uDate.getFullYear() === year && uDate.getMonth() === month;
      }).length;
      
      memberGrowthData.push({
        id: `mg_${year}_${month + 1}`,
        month: monthLabel,
        members: count,
      });
    }

    // --- Chart 2: Package Distribution ---
    const activeMemberships = await this.membershipRepository.find({
      where: { status: 'active' },
      relations: { package: true },
    });

    const packageCounts: { [name: string]: number } = {};
    let totalActive = 0;
    for (const m of activeMemberships) {
      if (m.package) {
        const pkgName = m.package.name;
        packageCounts[pkgName] = (packageCounts[pkgName] || 0) + 1;
        totalActive++;
      }
    }

    const colors = ['#3b82f6', '#FF7A00', '#10b981', '#a855f7', '#ec4899', '#eab308'];
    const packageDistribution = Object.entries(packageCounts).map(([name, count], index) => {
      const percentage = totalActive > 0 ? Math.round((count / totalActive) * 100) : 0;
      return {
        id: `pkg_${index}`,
        name,
        value: percentage,
        color: colors[index % colors.length],
      };
    });

    // --- Table: Recent Activities (Merged Check-ins & Transactions) ---
    const latestCheckins = await this.checkinRepository.find({
      relations: { user: true },
      order: { checkedInAt: 'DESC' },
      take: 5,
    });

    const latestTransactions = await this.transactionRepository.find({
      relations: { user: true, package: true },
      order: { transactionDate: 'DESC' },
      take: 5,
    });

    const activities = [
      ...latestCheckins.map(c => ({
        id: `checkin_${c.id}`,
        name: c.user?.fullName || 'Hội viên',
        avatar: c.user?.fullName ? c.user.fullName.split(' ').pop()?.substring(0, 2).toUpperCase() : 'HV',
        action: `Check-in`,
        time: c.checkedInAt,
        type: 'checkin'
      })),
      ...latestTransactions.map(t => ({
        id: `tx_${t.id}`,
        name: t.user?.fullName || 'Hội viên',
        avatar: t.user?.fullName ? t.user.fullName.split(' ').pop()?.substring(0, 2).toUpperCase() : 'HV',
        action: `Mua gói ${t.package?.name || 'tập'}`,
        time: t.transactionDate,
        type: 'purchase'
      }))
    ];

    activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    const recentActivities = activities.slice(0, 5).map(act => ({
      ...act,
      time: act.time.toISOString(),
    }));

    return {
      stats: {
        totalRevenue: {
          value: allTimeRevenue,
          change: `${revenueGrowth >= 0 ? '+' : ''}${revenueGrowth.toFixed(1)}%`,
          isIncrease: revenueGrowth >= 0,
        },
        newMembers: {
          value: thisMonthNewMembers,
          change: `${membersGrowth >= 0 ? '+' : ''}${membersGrowth.toFixed(1)}%`,
          isIncrease: membersGrowth >= 0,
        },
        activeMembers: {
          value: activeMembersCount,
          change: `${activeGrowth >= 0 ? '+' : ''}${activeGrowth.toFixed(1)}%`,
          isIncrease: activeGrowth >= 0,
        },
        expiringMemberships: {
          value: expiringCount,
          change: `${expiringGrowth >= 0 ? '+' : ''}${expiringGrowth.toFixed(1)}%`,
          isIncrease: expiringGrowth >= 0,
        }
      },
      memberGrowthData,
      packageDistribution,
      recentActivities,
    };
  }
}
