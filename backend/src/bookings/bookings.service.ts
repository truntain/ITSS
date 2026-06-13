import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
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
    await this.findOne(id); // Check existence
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
