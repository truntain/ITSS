import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { BodyRecordsService } from './body-records.service';
import { CreateBodyRecordDto } from './dto/create-body-record.dto';
import { UpdateBodyRecordDto } from './dto/update-body-record.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Body Records')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('body-records')
export class BodyRecordsController {
  constructor(private readonly bodyRecordsService: BodyRecordsService) {}

  @Post()
  @Roles('HV', 'PT')
  @ApiOperation({ summary: 'Ghi nhận chỉ số cơ thể mới (Hội viên/PT)' })
  create(@Body() createBodyRecordDto: CreateBodyRecordDto) {
    return this.bodyRecordsService.create(createBodyRecordDto);
  }

  @Get()
  @ApiOperation({ summary: 'Xem toàn bộ danh sách chỉ số cơ thể' })
  findAll() {
    return this.bodyRecordsService.findAll();
  }

  @Get('my-records')
  @Roles('HV')
  @ApiOperation({ summary: 'Xem danh sách chỉ số cơ thể của bản thân hội viên' })
  findMyRecords(@Request() req: any) {
    return this.bodyRecordsService.findMyRecords(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Xem chi tiết chỉ số cơ thể' })
  findOne(@Param('id') id: string) {
    return this.bodyRecordsService.findOne(+id);
  }

  @Patch(':id')
  @Roles('HV', 'PT')
  @ApiOperation({ summary: 'Cập nhật chỉ số cơ thể (Hội viên/PT)' })
  update(@Param('id') id: string, @Body() updateBodyRecordDto: UpdateBodyRecordDto) {
    return this.bodyRecordsService.update(+id, updateBodyRecordDto);
  }

  @Delete(':id')
  @Roles('AD', 'PT')
  @ApiOperation({ summary: 'Xóa bản ghi chỉ số cơ thể (Admin/PT)' })
  remove(@Param('id') id: string) {
    return this.bodyRecordsService.remove(+id);
  }
}
