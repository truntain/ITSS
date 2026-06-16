import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { MembershipsService } from '../memberships/memberships.service';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    private readonly membershipsService: MembershipsService,
  ) {}

  async create(createBookingDto: CreateBookingDto) {
    const booking = this.bookingRepository.create(createBookingDto);
    return this.bookingRepository.save(booking);
  }

  async findAll() {
    return this.bookingRepository.find({
      relations: { user: true, pt: true },
      order: { date: 'DESC', timeSlot: 'ASC' },
    });
  }

  async findOne(id: number) {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: { user: true, pt: true },
    });
    if (!booking) {
      throw new NotFoundException(`Không tìm thấy lịch đặt tập với ID #${id}`);
    }
    return booking;
  }

  async update(id: number, updateBookingDto: UpdateBookingDto) {
    const booking = await this.findOne(id); // Check existence

    // If the booking is being checked in, check if it had a PT and deduct a session
    if (updateBookingDto.attendanceStatus === 'checked_in' && booking.attendanceStatus !== 'checked_in') {
      if (booking.ptId && booking.ptId !== 11) { // 11 is the 'None/Self-training' placeholder
        const activeMembership = await this.membershipsService.findActiveByUserId(booking.userId);
        if (activeMembership && activeMembership.remainingSessions > 0) {
          await this.membershipsService.update(activeMembership.id, {
            remainingSessions: activeMembership.remainingSessions - 1,
          });
        }
      }
    }

    await this.bookingRepository.update(id, updateBookingDto);
    return this.findOne(id);
  }

  async findMyBookings(userId: number) {
    return this.bookingRepository.find({
      where: { userId },
      relations: { pt: true },
      order: { date: 'DESC', timeSlot: 'ASC' },
    });
  }

  async findPtBookings(ptId: number) {
    return this.bookingRepository.find({
      where: { ptId },
      relations: { user: true },
      order: { date: 'DESC', timeSlot: 'ASC' },
    });
  }

  async cancelMyBooking(bookingId: number, userId: number) {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId, userId },
    });
    if (!booking) {
      throw new NotFoundException(`Không tìm thấy lịch đặt tập với ID #${bookingId} của hội viên này`);
    }
    booking.status = 'cancelled';
    return this.bookingRepository.save(booking);
  }

  async remove(id: number) {
    const booking = await this.findOne(id);
    await this.bookingRepository.remove(booking);
    return { message: 'Xóa lịch đặt tập thành công' };
  }
}
