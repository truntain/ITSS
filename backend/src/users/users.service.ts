import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
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

  async update(id: number, updateData: Partial<User>): Promise<User> {
    await this.userRepository.update(id, updateData);
    const user = await this.findOne(id);
    if (!user) {
      throw new Error(`User not found with ID #${id}`);
    }
    return user;
  }
}
