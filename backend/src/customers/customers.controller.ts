import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('AD')
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) { }

  @Get()
  @ApiOperation({ summary: 'Xem danh sách toàn bộ hội viên (Admin)' })
  findAll() {
    return this.customersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Xem thông tin chi tiết hội viên (Admin)' })
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(+id);
  }

  @Post()
  @ApiOperation({ summary: 'Thêm hội viên mới kèm gói tập và hóa đơn (Admin)' })
  create(@Body() createCustomerDto: CreateCustomerDto, @Request() req: any) {
    const cashierId = req.user.id;
    return this.customersService.create(createCustomerDto, cashierId);
  }
}
