import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';

@Injectable()
export class StaffsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  create(createStaffDto: CreateStaffDto) {
    return 'This action adds a new staff';
  }

  async findAll() {
    return this.userRepository.find({
      where: {
        role: Not('HV'),
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        role: true,
        fullName: true,
        phone: true,
        avatar: true,
      },
      order: {
        fullName: 'ASC',
      },
    });
  }

  async findOne(id: number) {
    return this.userRepository.findOne({
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
      },
    });
  }

  update(id: number, updateStaffDto: UpdateStaffDto) {
    return `This action updates a #${id} staff`;
  }

  remove(id: number) {
    return `This action removes a #${id} staff`;
  }
}
