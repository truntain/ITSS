import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { CheckinsService } from './checkins.service';
import { CreateCheckinDto } from './dto/create-checkin.dto';
import { UpdateCheckinDto } from './dto/update-checkin.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Checkins')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('checkins')
export class CheckinsController {
  constructor(private readonly checkinsService: CheckinsService) {}

  @Post()
  @Roles('NV')
  @ApiOperation({ summary: 'Nhân viên thực hiện điểm danh cho hội viên (Staff)' })
  create(@Body() createCheckinDto: CreateCheckinDto, @Request() req: any) {
    if (!createCheckinDto.checkedInBy) {
      createCheckinDto.checkedInBy = req.user?.id;
    }
    return this.checkinsService.create(createCheckinDto);
  }

  @Get('verify-member/:idOrCode')
  @Roles('NV', 'AD')
  @ApiOperation({ summary: 'Kiểm tra thông tin thẻ hội viên trước khi điểm danh (Staff)' })
  verifyMember(@Param('idOrCode') idOrCode: string) {
    return this.checkinsService.verifyMemberCheckin(idOrCode);
  }

  @Get('today-stats')
  @Roles('NV', 'AD')
  @ApiOperation({ summary: 'Lấy thống kê điểm danh hôm nay' })
  getTodayStats() {
    return this.checkinsService.getTodayStats();
  }

  @Get()
  @ApiOperation({ summary: 'Xem toàn bộ danh sách điểm danh' })
  findAll(@Query('date') date?: string) {
    return this.checkinsService.findAll(date);
  }

  @Get('my-history')
  @Roles('HV')
  @ApiOperation({ summary: 'Xem lịch sử điểm danh của bản thân hội viên' })
  findMyHistory(@Request() req: any) {
    return this.checkinsService.findMyHistory(req.user.id);
  }

  @Get('my-status')
  @Roles('HV')
  @ApiOperation({ summary: 'Xem trạng thái check-in hôm nay và gói tập của hội viên' })
  findMyStatus(@Request() req: any) {
    return this.checkinsService.findMyStatus(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Xem chi tiết một bản ghi điểm danh' })
  findOne(@Param('id') id: string) {
    return this.checkinsService.findOne(+id);
  }

  @Patch(':id')
  @Roles('AD', 'NV')
  @ApiOperation({ summary: 'Cập nhật bản ghi điểm danh (Admin/Nhân viên)' })
  update(@Param('id') id: string, @Body() updateCheckinDto: UpdateCheckinDto) {
    return this.checkinsService.update(+id, updateCheckinDto);
  }

  @Delete(':id')
  @Roles('AD')
  @ApiOperation({ summary: 'Xóa bản ghi điểm danh (Admin)' })
  remove(@Param('id') id: string) {
    return this.checkinsService.remove(+id);
  }
}
