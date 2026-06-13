import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Announcements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Post()
  @Roles('AD', 'NV')
  @ApiOperation({ summary: 'Tạo thông báo mới (Admin/Nhân viên)' })
  create(@Body() createAnnouncementDto: CreateAnnouncementDto) {
    return this.announcementsService.create(createAnnouncementDto);
  }

  @Get()
  @ApiOperation({ summary: 'Xem danh sách tất cả thông báo' })
  findAll() {
    return this.announcementsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Xem thông tin chi tiết một thông báo' })
  findOne(@Param('id') id: string) {
    return this.announcementsService.findOne(+id);
  }

  @Patch(':id')
  @Roles('AD', 'NV')
  @ApiOperation({ summary: 'Cập nhật thông tin thông báo (Admin/Nhân viên)' })
  update(@Param('id') id: string, @Body() updateAnnouncementDto: UpdateAnnouncementDto) {
    return this.announcementsService.update(+id, updateAnnouncementDto);
  }

  @Delete(':id')
  @Roles('AD', 'NV')
  @ApiOperation({ summary: 'Xóa thông báo (Admin/Nhân viên)' })
  remove(@Param('id') id: string) {
    return this.announcementsService.remove(+id);
  }
}
