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
    
    const payload = { email: newUser.email, sub: newUser.id };
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

    const payload = { email: user.email, sub: user.id };
    const { password: _, ...userWithoutPassword } = user;
    return {
      access_token: this.jwtService.sign(payload),
      user: userWithoutPassword,
    };
  }
}
