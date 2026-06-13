import { Controller, Post, Body, Get, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: RegisterDto) {
    if (!body) {
      throw new BadRequestException('Request body không được để trống hoặc sai định dạng JSON!');
    }
    await this.authService.register(
      body.email,
      body.password,
      'HV',
      body.fullName,
      body.phone,
    );
    return { message: 'Đăng ký thành công' };
  }

  @Post('login')
  async login(@Body() body: LoginDto) {
    if (!body) {
      throw new BadRequestException('Request body không được để trống hoặc sai định dạng JSON!');
    }
    return this.authService.login(body.email, body.password);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('profile')
  getProfile(@Request() req: any) {
    return req.user;
  }
}
