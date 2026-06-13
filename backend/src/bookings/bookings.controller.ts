import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Bookings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @Roles('HV')
  @ApiOperation({ summary: 'Hội viên đăng ký lịch hẹn tập mới (Member)' })
  create(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingsService.create(createBookingDto);
  }

  @Get('my-bookings')
  @Roles('HV')
  @ApiOperation({ summary: 'Xem danh sách lịch đặt tập của bản thân hội viên' })
  findMyBookings(@Request() req: any) {
    return this.bookingsService.findMyBookings(req.user.id);
  }

  @Get('pt-bookings')
  @Roles('PT')
  @ApiOperation({ summary: 'Xem danh sách lịch dạy của bản thân PT' })
  findPtBookings(@Request() req: any) {
    return this.bookingsService.findPtBookings(req.user.id);
  }

  @Patch('my-bookings/:id/cancel')
  @Roles('HV')
  @ApiOperation({ summary: 'Hội viên tự hủy lịch đặt tập' })
  cancelMyBooking(@Param('id') id: string, @Request() req: any) {
    return this.bookingsService.cancelMyBooking(+id, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Xem toàn bộ danh sách lịch đặt tập' })
  findAll() {
    return this.bookingsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Xem chi tiết một lịch hẹn' })
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(+id);
  }

  @Patch(':id')
  @Roles('AD', 'PT')
  @ApiOperation({ summary: 'Xác nhận/Hủy lịch hẹn hoặc điểm danh (Admin/PT)' })
  update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
    return this.bookingsService.update(+id, updateBookingDto);
  }

  @Delete(':id')
  @Roles('AD')
  @ApiOperation({ summary: 'Xóa lịch hẹn (Admin)' })
  remove(@Param('id') id: string) {
    return this.bookingsService.remove(+id);
  }
}
