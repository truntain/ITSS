import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { CheckoutDto } from './dto/checkout.dto';
import { PaymentsService } from './payments.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // --- Voucher Endpoints ---
  @Post('vouchers')
  @Roles('AD')
  @ApiOperation({ summary: 'Tạo mã voucher mới (Admin)' })
  createVoucher(@Body() dto: CreateVoucherDto) {
    return this.paymentsService.createVoucher(dto);
  }

  @Get('vouchers')
  @ApiOperation({ summary: 'Xem danh sách tất cả voucher' })
  findAllVouchers() {
    return this.paymentsService.findAllVouchers();
  }

  @Get('vouchers/:id')
  @ApiOperation({ summary: 'Xem thông tin chi tiết một voucher' })
  findOneVoucher(@Param('id') id: string) {
    return this.paymentsService.findOneVoucher(+id);
  }

  @Patch('vouchers/:id')
  @Roles('AD')
  @ApiOperation({ summary: 'Cập nhật thông tin voucher (Admin)' })
  updateVoucher(@Param('id') id: string, @Body() dto: UpdateVoucherDto) {
    return this.paymentsService.updateVoucher(+id, dto);
  }

  @Delete('vouchers/:id')
  @Roles('AD')
  @ApiOperation({ summary: 'Xóa voucher (Admin)' })
  removeVoucher(@Param('id') id: string) {
    return this.paymentsService.removeVoucher(+id);
  }

  // --- Checkout Endpoints ---
  @Get('vouchers/code/:code')
  @Roles('AD', 'NV', 'HV')
  @ApiOperation({ summary: 'Kiểm tra thông tin voucher qua mã code' })
  findOneByCode(@Param('code') code: string) {
    return this.paymentsService.findOneVoucherByCode(code);
  }

  @Post('checkout')
  @Roles('AD', 'NV')
  @ApiOperation({ summary: 'Thực hiện thanh toán gói tập cho hội viên' })
  checkout(@Body() dto: CheckoutDto, @Req() req: any) {
    const cashierId = req.user?.id;
    return this.paymentsService.checkout(dto, cashierId);
  }

  // --- Transaction Endpoints ---
  @Post('transactions')
  @Roles('AD', 'NV')
  @ApiOperation({ summary: 'Xuất hóa đơn giao dịch mới (Admin/Nhân viên)' })
  create(@Body() dto: CreateTransactionDto) {
    return this.paymentsService.create(dto);
  }

  @Get('transactions')
  @Roles('AD', 'NV')
  @ApiOperation({ summary: 'Xem danh sách tất cả hóa đơn giao dịch (Admin/Nhân viên)' })
  findAll() {
    return this.paymentsService.findAll();
  }

  @Get('transactions/:id')
  @Roles('AD', 'NV', 'HV')
  @ApiOperation({ summary: 'Xem chi tiết một hóa đơn giao dịch' })
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(+id);
  }

  @Patch('transactions/:id')
  @Roles('AD', 'NV')
  @ApiOperation({ summary: 'Cập nhật thông tin hóa đơn giao dịch (Admin/Nhân viên)' })
  update(@Param('id') id: string, @Body() dto: UpdateTransactionDto) {
    return this.paymentsService.update(+id, dto);
  }

  @Delete('transactions/:id')
  @Roles('AD')
  @ApiOperation({ summary: 'Xóa hóa đơn giao dịch (Admin)' })
  remove(@Param('id') id: string) {
    return this.paymentsService.remove(+id);
  }
}
