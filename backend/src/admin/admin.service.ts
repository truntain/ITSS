import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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
}
