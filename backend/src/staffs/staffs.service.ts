import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class StaffsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createStaffDto: CreateStaffDto) {
    const { fullName, email, phone, role, password } = createStaffDto;

    const existing = await this.userRepository.findOne({ where: { email } });
    if (existing) {
      throw new BadRequestException('Email đã tồn tại!');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password || '123456', salt); // Mật khẩu

    let dbRole: UserRole = 'NV';
    if (role === 'Quản lý') dbRole = 'AD';
    else if (role === 'PT') dbRole = 'PT';

    // Sinh initials avatar
    const nameParts = fullName.trim().split(' ');
    const avatar = nameParts.length >= 2
      ? nameParts[0][0] + nameParts[nameParts.length - 1][0]
      : fullName.slice(0, 2);

    const newStaff = this.userRepository.create({
      email,
      password: hashedPassword,
      fullName,
      phone,
      role: dbRole,
      status: 'working',
      isActive: true,
      avatar: avatar.toUpperCase(),
    });

    const saved = await this.userRepository.save(newStaff);
    const { password: _, ...result } = saved;
    return result;
  }

  async findAll() {
    return this.userRepository.find({
      where: {
        role: Not('HV'),
      },
      select: {
        id: true,
        email: true,
        role: true,
        fullName: true,
        phone: true,
        avatar: true,
        status: true,
        isActive: true,
        createdAt: true,
        birthDate: true,
        gender: true,
      },
      order: {
        id: 'ASC',
      },
    });
  }

  async findOne(id: number) {
    const staff = await this.userRepository.findOne({
      where: {
        id,
        role: Not('HV'),
      },
      select: {
        id: true,
        email: true,
        role: true,
        fullName: true,
        phone: true,
        avatar: true,
        status: true,
        isActive: true,
        createdAt: true,
        birthDate: true,
        gender: true,
      },
    });

    if (!staff) {
      throw new NotFoundException(`Không tìm thấy nhân viên với ID #${id}`);
    }

    return staff;
  }

  async update(id: number, updateStaffDto: UpdateStaffDto) {
    const staff = await this.findOne(id);

    const { fullName, phone, role, status } = updateStaffDto;
    const updateData: any = {};

    if (fullName !== undefined) {
      updateData.fullName = fullName;
      // Cập nhật avatar initials nếu tên thay đổi
      const nameParts = fullName.trim().split(' ');
      const avatar = nameParts.length >= 2
        ? nameParts[0][0] + nameParts[nameParts.length - 1][0]
        : fullName.slice(0, 2);
      updateData.avatar = avatar.toUpperCase();
    }

    if (phone !== undefined) {
      updateData.phone = phone;
    }

    if (role !== undefined) {
      let dbRole: UserRole = 'NV';
      if (role === 'Quản lý') dbRole = 'AD';
      else if (role === 'PT') dbRole = 'PT';
      updateData.role = dbRole;
    }

    if (status !== undefined) {
      updateData.status = status;
      // Gán thủ công để khớp với trigger trong DB mà không cần đợi reload
      updateData.isActive = status !== 'quit';
    }

    await this.userRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number) {
    const staff = await this.findOne(id);
    try {
      await this.userRepository.remove(staff);
      return { message: 'Xóa nhân sự thành công' };
    } catch (error: any) {
      if (error.code === '23503') {
        throw new BadRequestException(
          'Nhân viên này đã có dữ liệu liên kết (ca trực, lịch sử check-in hoặc giao dịch) trong hệ thống. ' +
          'Không thể xóa. Vui lòng chuyển trạng thái sang "Đã nghỉ việc" để vô hiệu hóa tài khoản.'
        );
      }
      throw error;
    }
  }
}
