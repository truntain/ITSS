import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(
    email: string,
    password: string,
    role: UserRole = 'HV',
    fullName: string = '',
    phone: string = '',
  ) {
    if (!email || !password) {
      throw new BadRequestException('Email và mật khẩu không được để trống!');
    }

    const existingUser = await this.usersService.findOneByEmail(email);
    if (existingUser) {
      throw new BadRequestException('Email đã tồn tại!');
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await this.usersService.create(
      email,
      passwordHash,
      role,
      fullName,
      phone,
    );
    
    const payload = { email: newUser.email, sub: newUser.id, role: newUser.role };
    const { password: _, ...userWithoutPassword } = newUser;
    return {
      access_token: this.jwtService.sign(payload),
      user: userWithoutPassword,
    };
  }

  async login(email: string, password: string) {
    if (!email || !password) {
      throw new BadRequestException('Email và mật khẩu không được để trống!');
    }

    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không hợp lệ!');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password || '');
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không hợp lệ!');
    }

    const payload = { email: user.email, sub: user.id, role: user.role };
    const { password: _, ...userWithoutPassword } = user;
    return {
      access_token: this.jwtService.sign(payload),
      user: userWithoutPassword,
    };
  }

  async getProfile(userId: number) {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new BadRequestException('Người dùng không tồn tại!');
    }
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateProfile(userId: number, updateData: any) {
    const allowedFields = ['fullName', 'phone', 'birthDate', 'gender', 'height', 'avatar'];
    const filteredUpdateData: any = {};
    for (const key of allowedFields) {
      if (updateData[key] !== undefined) {
        if (key === 'height' && updateData[key] !== null) {
          filteredUpdateData[key] = Number(updateData[key]);
        } else if (key === 'birthDate' && (updateData[key] === '' || updateData[key] === null)) {
          filteredUpdateData[key] = null;
        } else {
          filteredUpdateData[key] = updateData[key];
        }
      }
    }

    const updatedUser = await this.usersService.update(userId, filteredUpdateData);
    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  async changePassword(userId: number, currentPass: string, newPass: string) {
    if (!currentPass || !newPass) {
      throw new BadRequestException('Mật khẩu cũ và mật khẩu mới không được để trống!');
    }

    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new BadRequestException('Người dùng không tồn tại!');
    }

    const isPasswordValid = await bcrypt.compare(currentPass, user.password || '');
    if (!isPasswordValid) {
      throw new BadRequestException('Mật khẩu hiện tại không chính xác!');
    }

    const salt = await bcrypt.genSalt();
    const newPasswordHash = await bcrypt.hash(newPass, salt);

    await this.usersService.update(userId, { password: newPasswordHash });
    return { message: 'Đổi mật khẩu thành công' };
  }
}
