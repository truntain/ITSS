import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CheckoutDto } from './dto/checkout.dto';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Voucher } from './entities/voucher.entity';
import { Transaction } from './entities/transaction.entity';
import { User } from '../users/entities/user.entity';
import { Membership } from '../memberships/entities/membership.entity';
import { Package } from '../memberships/entities/package.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Voucher)
    private readonly voucherRepository: Repository<Voucher>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Membership)
    private readonly membershipRepository: Repository<Membership>,
    @InjectRepository(Package)
    private readonly packageRepository: Repository<Package>,
    private readonly dataSource: DataSource,
  ) {}

  // --- Voucher CRUD ---
  async createVoucher(dto: CreateVoucherDto) {
    const existing = await this.voucherRepository.findOne({ where: { code: dto.code } });
    if (existing) {
      throw new BadRequestException(`Voucher với mã #${dto.code} đã tồn tại!`);
    }
    const voucher = this.voucherRepository.create(dto);
    return this.voucherRepository.save(voucher);
  }

  async findAllVouchers() {
    return this.voucherRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOneVoucher(id: number) {
    const voucher = await this.voucherRepository.findOne({ where: { id } });
    if (!voucher) {
      throw new NotFoundException(`Không tìm thấy voucher với ID #${id}`);
    }
    return voucher;
  }

  async updateVoucher(id: number, dto: UpdateVoucherDto) {
    await this.findOneVoucher(id);
    if (dto.code) {
      const existing = await this.voucherRepository.findOne({ where: { code: dto.code } });
      if (existing && existing.id !== id) {
        throw new BadRequestException(`Voucher với mã #${dto.code} đã tồn tại!`);
      }
    }
    await this.voucherRepository.update(id, dto);
    return this.findOneVoucher(id);
  }

  async removeVoucher(id: number) {
    const voucher = await this.findOneVoucher(id);
    await this.voucherRepository.remove(voucher);
    return { message: 'Xóa voucher thành công' };
  }

  // --- Transaction CRUD ---
  async create(dto: CreateTransactionDto) {
    // Check if receiptNo is unique
    const existing = await this.transactionRepository.findOne({ where: { receiptNo: dto.receiptNo } });
    if (existing) {
      throw new BadRequestException(`Giao dịch với mã hóa đơn #${dto.receiptNo} đã tồn tại!`);
    }

    // Verify User
    const user = await this.userRepository.findOne({ where: { id: dto.userId } });
    if (!user) {
      throw new BadRequestException(`Không tìm thấy người dùng với ID #${dto.userId}`);
    }

    // Verify Membership
    const membership = await this.membershipRepository.findOne({ where: { id: dto.membershipId } });
    if (!membership) {
      throw new BadRequestException(`Không tìm thấy đăng ký hội viên với ID #${dto.membershipId}`);
    }

    // Verify Package
    const pkg = await this.packageRepository.findOne({ where: { id: dto.packageId } });
    if (!pkg) {
      throw new BadRequestException(`Không tìm thấy gói tập với ID #${dto.packageId}`);
    }

    // Verify Cashier
    if (dto.cashierId) {
      const cashier = await this.userRepository.findOne({ where: { id: dto.cashierId } });
      if (!cashier) {
        throw new BadRequestException(`Không tìm thấy nhân viên thu ngân với ID #${dto.cashierId}`);
      }
    }

    // Verify and handle Voucher
    if (dto.voucherId) {
      const voucher = await this.findOneVoucher(dto.voucherId);
      if (voucher.status !== 'active') {
        throw new BadRequestException(`Voucher không còn hoạt động (Trạng thái: ${voucher.status})`);
      }
      if (voucher.used >= voucher.total) {
        throw new BadRequestException('Voucher đã hết số lượt sử dụng!');
      }
      // Increment used count
      await this.voucherRepository.update(voucher.id, {
        used: voucher.used + 1,
        status: voucher.used + 1 >= voucher.total ? 'depleted' : 'active',
      });
    }

    const transaction = this.transactionRepository.create(dto);
    return this.transactionRepository.save(transaction);
  }

  async findAll() {
    return this.transactionRepository.find({
      relations: { user: true, membership: true, package: true, voucher: true, cashier: true },
      order: { transactionDate: 'DESC' },
    });
  }

  async findAllByUserId(userId: number) {
    return this.transactionRepository.find({
      where: { userId },
      relations: { package: true, voucher: true },
      order: { transactionDate: 'DESC' },
    });
  }

  async findOne(id: number) {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
      relations: { user: true, membership: true, package: true, voucher: true, cashier: true },
    });
    if (!transaction) {
      throw new NotFoundException(`Không tìm thấy giao dịch hóa đơn với ID #${id}`);
    }
    return transaction;
  }

  async update(id: number, dto: UpdateTransactionDto) {
    await this.findOne(id);
    if (dto.receiptNo) {
      const existing = await this.transactionRepository.findOne({ where: { receiptNo: dto.receiptNo } });
      if (existing && existing.id !== id) {
        throw new BadRequestException(`Giao dịch với mã hóa đơn #${dto.receiptNo} đã tồn tại!`);
      }
    }
    if (dto.userId) {
      const user = await this.userRepository.findOne({ where: { id: dto.userId } });
      if (!user) throw new BadRequestException(`Không tìm thấy người dùng với ID #${dto.userId}`);
    }
    if (dto.membershipId) {
      const membership = await this.membershipRepository.findOne({ where: { id: dto.membershipId } });
      if (!membership) throw new BadRequestException(`Không tìm thấy đăng ký hội viên với ID #${dto.membershipId}`);
    }
    if (dto.packageId) {
      const pkg = await this.packageRepository.findOne({ where: { id: dto.packageId } });
      if (!pkg) throw new BadRequestException(`Không tìm thấy gói tập với ID #${dto.packageId}`);
    }
    if (dto.cashierId) {
      const cashier = await this.userRepository.findOne({ where: { id: dto.cashierId } });
      if (!cashier) throw new BadRequestException(`Không tìm thấy nhân viên thu ngân với ID #${dto.cashierId}`);
    }
    if (dto.voucherId) {
      await this.findOneVoucher(dto.voucherId);
    }

    await this.transactionRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const transaction = await this.findOne(id);
    await this.transactionRepository.remove(transaction);
    return { message: 'Xóa giao dịch thành công' };
  }

  // --- Voucher lookup and validation ---
  async findOneVoucherByCode(code: string) {
    const voucher = await this.voucherRepository.findOne({
      where: { code: code.toUpperCase() },
    });
    if (!voucher) {
      throw new NotFoundException(`Mã giảm giá không tồn tại!`);
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (voucher.status !== 'active' || todayStr < voucher.startDate || todayStr > voucher.endDate) {
      throw new BadRequestException('Mã giảm giá đã hết hạn hoặc không hoạt động!');
    }

    if (voucher.used >= voucher.total) {
      throw new BadRequestException('Mã giảm giá đã hết lượt sử dụng!');
    }

    return voucher;
  }

  // --- Checkout ---
  async checkout(dto: CheckoutDto, cashierId?: number) {
    return this.dataSource.transaction(async (manager) => {
      // 1. Verify User
      const user = await manager.findOne(User, { where: { id: dto.userId } });
      if (!user) {
        throw new BadRequestException(`Không tìm thấy người dùng với ID #${dto.userId}`);
      }

      // 2. Verify Package
      const pkg = await manager.findOne(Package, { where: { id: dto.packageId } });
      if (!pkg) {
        throw new BadRequestException(`Không tìm thấy gói tập với ID #${dto.packageId}`);
      }

      // 3. Verify and handle Voucher (if code is provided)
      let voucher: Voucher | null = null;
      let discount = 0;
      if (dto.voucherCode) {
        voucher = await manager.findOne(Voucher, { where: { code: dto.voucherCode.toUpperCase() } });
        if (!voucher) {
          throw new BadRequestException(`Mã giảm giá không tồn tại!`);
        }
        if (voucher.status !== 'active') {
          throw new BadRequestException('Mã giảm giá không hoạt động!');
        }
        if (voucher.used >= voucher.total) {
          throw new BadRequestException('Mã giảm giá đã hết lượt sử dụng!');
        }
        
        const todayStr = new Date().toISOString().split('T')[0];
        if (todayStr < voucher.startDate || todayStr > voucher.endDate) {
          throw new BadRequestException('Mã giảm giá đã hết hạn sử dụng!');
        }

        // Calculate discount
        if (voucher.discountType === 'percent') {
          discount = (Number(pkg.price) * Number(voucher.discountValue)) / 100;
        } else {
          discount = Number(voucher.discountValue);
        }

        // Increment usage
        voucher.used += 1;
        if (voucher.used >= voucher.total) {
          voucher.status = 'depleted';
        }
        await manager.save(Voucher, voucher);
      }

      // 4. Calculate Membership Dates
      const startDate = new Date();
      const startDateStr = startDate.toISOString().split('T')[0];
      
      const endDate = new Date();
      endDate.setMonth(startDate.getMonth() + pkg.durationMonths);
      const endDateStr = endDate.toISOString().split('T')[0];

      // Sessions check
      let totalSessions = 0;
      if (pkg.benefits && typeof pkg.benefits === 'object' && typeof pkg.benefits.sessions === 'number') {
        totalSessions = pkg.benefits.sessions;
      } else if (pkg.id.toLowerCase().includes('pt') || pkg.name.toLowerCase().includes('pt')) {
        totalSessions = 20; // Default sessions for PT packages
      }

      // Create Membership
      const membership = new Membership();
      membership.userId = user.id;
      membership.packageId = pkg.id;
      membership.startDate = startDateStr;
      membership.endDate = endDateStr;
      membership.totalSessions = totalSessions;
      membership.remainingSessions = totalSessions;
      membership.status = 'active';
      const savedMembership = await manager.save(Membership, membership);

      // Generate receipt number
      const receiptNo = `BILL-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

      // 5. Create Transaction
      const transaction = new Transaction();
      transaction.receiptNo = receiptNo;
      transaction.userId = user.id;
      transaction.membershipId = savedMembership.id;
      transaction.packageId = pkg.id;
      if (voucher) {
        transaction.voucherId = voucher.id;
      }
      transaction.originalAmount = Number(pkg.price);
      transaction.discountAmount = discount;
      transaction.finalAmount = Number(pkg.price) - discount;
      transaction.paymentMethod = dto.paymentMethod === 'cash' ? 'Tiền mặt' : dto.paymentMethod === 'card' ? 'Quẹt thẻ' : 'Chuyển khoản';
      if (cashierId) {
        transaction.cashierId = cashierId;
      }
      transaction.transactionDate = new Date();
      const savedTransaction = await manager.save(Transaction, transaction);

      return {
        membership: savedMembership,
        transaction: savedTransaction,
      };
    });
  }
}
