import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Membership } from '../memberships/entities/membership.entity';
import { Checkin } from '../checkins/entities/checkin.entity';
import { BodyRecord } from '../body-records/entities/body-record.entity';
import { Package } from '../memberships/entities/package.entity';
import { Transaction } from '../payments/entities/transaction.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Membership)
    private readonly membershipRepository: Repository<Membership>,
    @InjectRepository(Checkin)
    private readonly checkinRepository: Repository<Checkin>,
    @InjectRepository(BodyRecord)
    private readonly bodyRecordRepository: Repository<BodyRecord>,
    @InjectRepository(Package)
    private readonly packageRepository: Repository<Package>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) { }

  // Lấy danh sách khách hàng (role = 'HV')
  async findAll() {
    const users = await this.userRepository.find({
      where: { role: 'HV' },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        gender: true,
        birthDate: true,
        height: true,
        createdAt: true,
      },
      order: { id: 'ASC' },
    });

    const result: any[] = [];
    const today = new Date();

    for (const user of users) {
      // Gói tập kết thúc muộn nhất
      const membership = await this.membershipRepository.findOne({
        where: { userId: user.id },
        relations: { package: true },
        order: { endDate: 'DESC' },
      });

      // Lần check-in gần nhất
      const lastCheckin = await this.checkinRepository.findOne({
        where: { userId: user.id },
        order: { checkedInAt: 'DESC' },
      });

      let daysLeft = 0;
      let packageDuration = 30; // Mặc định nếu chưa đăng ký gói
      if (membership) {
        const end = new Date(membership.endDate);
        const start = new Date(membership.startDate);
        const diffTime = end.getTime() - today.getTime();
        daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        packageDuration = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
      }

      result.push({
        id: String(user.id),
        name: user.fullName || user.email,
        email: user.email,
        phone: user.phone || '',
        packageName: membership?.package?.name || 'Chưa đăng ký',
        packageExpiry: membership ? new Date(membership.endDate).toLocaleDateString('vi-VN') : 'N/A',
        daysLeft,
        packageDuration,
        status: !membership ? 'Expired' : daysLeft <= 0 ? 'Expired' : daysLeft <= 7 ? 'Expiring' : 'Active',
        debt: 0, // Mặc định nợ cước là 0
        lastCheckIn: lastCheckin ? new Date(lastCheckin.checkedInAt).toLocaleDateString('vi-VN') : 'Chưa check-in',
      });
    }

    return result;
  }

  // Xem chi tiết hội viên
  async findOne(id: number) {
    const user = await this.userRepository.findOne({
      where: { id, role: 'HV' },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        gender: true,
        birthDate: true,
        height: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`Không tìm thấy hội viên với ID #${id}`);
    }

    // Gói tập kết thúc muộn nhất
    const membership = await this.membershipRepository.findOne({
      where: { userId: user.id },
      relations: { package: true },
      order: { endDate: 'DESC' },
    });

    const today = new Date();
    let daysLeft = 0;
    let packageDuration = 30;
    if (membership) {
      const end = new Date(membership.endDate);
      const start = new Date(membership.startDate);
      daysLeft = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      packageDuration = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    }

    // BMI History
    const bodyRecords = await this.bodyRecordRepository.find({
      where: { userId: user.id },
      order: { recordedDate: 'ASC' },
    });

    const heightInMeters = user.height ? Number(user.height) / 100 : 1.7;
    const bmiHistory = bodyRecords.map((rec) => {
      const weight = Number(rec.weight);
      const bmiVal = weight / (heightInMeters * heightInMeters);
      const date = new Date(rec.recordedDate);
      return {
        id: String(rec.id),
        month: `T${date.getMonth() + 1}`,
        bmi: Number(bmiVal.toFixed(1)),
      };
    });

    // Lấy 10 lượt check-in gần nhất
    const checkins = await this.checkinRepository.find({
      where: { userId: user.id },
      order: { checkedInAt: 'DESC' },
      take: 10,
    });

    const checkinHistory = checkins.map((c) => {
      const dateObj = new Date(c.checkedInAt);
      return {
        date: dateObj.toLocaleDateString('vi-VN'),
        time: dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false }),
      };
    });

    return {
      id: String(user.id),
      name: user.fullName || user.email,
      email: user.email,
      phone: user.phone || '',
      packageName: membership?.package?.name || 'Chưa đăng ký',
      packageExpiry: membership ? new Date(membership.endDate).toLocaleDateString('vi-VN') : 'N/A',
      daysLeft,
      packageDuration,
      status: !membership ? 'Expired' : daysLeft <= 0 ? 'Expired' : daysLeft <= 7 ? 'Expiring' : 'Active',
      debt: 0,
      bmiHistory,
      checkinHistory,
    };
  }

  // Tạo hội viên mới
  async create(createCustomerDto: CreateCustomerDto, cashierId: number) {
    const { fullName, email, phone, gender, birthDate, height, packageId, password } = createCustomerDto;

    const existing = await this.userRepository.findOne({ where: { email } });
    if (existing) {
      throw new BadRequestException('Email đã tồn tại!');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password || '123456', salt); // Mật khẩu

    // 1. Lưu User
    const newUser = this.userRepository.create({
      email,
      password: hashedPassword,
      role: 'HV',
      fullName,
      phone,
      gender: gender as any,
      birthDate: birthDate ? new Date(birthDate) : undefined,
      height: height ? Number(height) : undefined,
      isActive: true,
      status: 'working',
    });

    const savedUser = await this.userRepository.save(newUser);

    // 2. Tạo Đăng ký gói (Membership)
    const pkg = await this.packageRepository.findOne({ where: { id: packageId } });
    if (!pkg) {
      throw new NotFoundException(`Không tìm thấy gói tập với ID #${packageId}`);
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(startDate.getMonth() + pkg.durationMonths);

    const membership = this.membershipRepository.create({
      userId: savedUser.id,
      packageId: pkg.id,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      status: 'active',
      totalSessions: 0,
      remainingSessions: 0,
    });

    const savedMembership = await this.membershipRepository.save(membership);

    // 3. Tạo Giao dịch thanh toán (Transaction)
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const receiptNo = `REC_${todayStr}_${Math.floor(1000 + Math.random() * 9000)}`;

    const transaction = this.transactionRepository.create({
      receiptNo,
      userId: savedUser.id,
      membershipId: savedMembership.id,
      packageId: pkg.id,
      originalAmount: pkg.price,
      discountAmount: 0,
      finalAmount: pkg.price,
      paymentMethod: 'CASH',
      cashierId,
    });

    await this.transactionRepository.save(transaction);

    return savedUser;
  }
}
