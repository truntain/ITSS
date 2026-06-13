import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FacilitiesService } from './facilities.service';
import { CreateFacilityDto } from './dto/create-facility.dto';
import { UpdateFacilityDto } from './dto/update-facility.dto';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { CreateEquipmentReportDto } from './dto/create-equipment-report.dto';
import { UpdateEquipmentReportDto } from './dto/update-equipment-report.dto';
import { UpdateGymSettingDto } from './dto/update-gym-setting.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Facilities & Equipment')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('facilities')
export class FacilitiesController {
  constructor(private readonly facilitiesService: FacilitiesService) {}

  // ==========================================
  // 1. ENDPOINTS PHÒNG TẬP (FACILITY)
  // ==========================================
  @Get('settings')
  @ApiOperation({ summary: 'Xem cài đặt chung của phòng tập (Gym Settings)' })
  getGymSettings() {
    return this.facilitiesService.getGymSettings();
  }

  @Patch('settings')
  @Roles('AD')
  @ApiOperation({ summary: 'Cập nhật cài đặt chung của phòng tập (Gym Settings) (Admin)' })
  updateGymSettings(@Body() updateGymSettingDto: UpdateGymSettingDto) {
    return this.facilitiesService.updateGymSettings(updateGymSettingDto);
  }

  @Post()
  @Roles('AD')
  @ApiOperation({ summary: 'Tạo phòng tập mới (Admin)' })
  createFacility(@Body() createFacilityDto: CreateFacilityDto) {
    return this.facilitiesService.createFacility(createFacilityDto);
  }

  @Get()
  @ApiOperation({ summary: 'Xem danh sách phòng tập' })
  findAllFacilities() {
    return this.facilitiesService.findAllFacilities();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Xem chi tiết một phòng tập' })
  findOneFacility(@Param('id') id: string) {
    return this.facilitiesService.findOneFacility(+id);
  }

  @Patch(':id')
  @Roles('AD')
  @ApiOperation({ summary: 'Cập nhật phòng tập (Admin)' })
  updateFacility(@Param('id') id: string, @Body() updateFacilityDto: UpdateFacilityDto) {
    return this.facilitiesService.updateFacility(+id, updateFacilityDto);
  }

  @Delete(':id')
  @Roles('AD')
  @ApiOperation({ summary: 'Xóa phòng tập (Admin)' })
  removeFacility(@Param('id') id: string) {
    return this.facilitiesService.removeFacility(+id);
  }

  // ==========================================
  // 2. ENDPOINTS THIẾT BỊ (EQUIPMENT)
  // ==========================================
  @Post('equipment/create')
  @Roles('AD')
  @ApiOperation({ summary: 'Thêm thiết bị tập luyện mới (Admin)' })
  createEquipment(@Body() createEquipmentDto: CreateEquipmentDto) {
    return this.facilitiesService.createEquipment(createEquipmentDto);
  }

  @Get('equipment/list')
  @ApiOperation({ summary: 'Xem danh sách thiết bị' })
  findAllEquipment() {
    return this.facilitiesService.findAllEquipment();
  }

  @Get('equipment/:id')
  @ApiOperation({ summary: 'Xem chi tiết thiết bị' })
  findOneEquipment(@Param('id') id: string) {
    return this.facilitiesService.findOneEquipment(+id);
  }

  @Patch('equipment/:id')
  @Roles('AD')
  @ApiOperation({ summary: 'Cập nhật thiết bị (Admin)' })
  updateEquipment(@Param('id') id: string, @Body() updateEquipmentDto: UpdateEquipmentDto) {
    return this.facilitiesService.updateEquipment(+id, updateEquipmentDto);
  }

  @Delete('equipment/:id')
  @Roles('AD')
  @ApiOperation({ summary: 'Xóa thiết bị (Admin)' })
  removeEquipment(@Param('id') id: string) {
    return this.facilitiesService.removeEquipment(+id);
  }

  // ==========================================
  // 3. ENDPOINTS BÁO CÁO HỎNG (EQUIPMENT REPORT)
  // ==========================================
  @Post('reports/create')
  @ApiOperation({ summary: 'Báo cáo thiết bị hỏng hóc (Mọi người dùng)' })
  createEquipmentReport(@Body() createEquipmentReportDto: CreateEquipmentReportDto) {
    return this.facilitiesService.createEquipmentReport(createEquipmentReportDto);
  }

  @Get('reports/list')
  @ApiOperation({ summary: 'Xem danh sách tất cả các báo cáo hỏng hóc' })
  findAllEquipmentReports() {
    return this.facilitiesService.findAllEquipmentReports();
  }

  @Get('reports/:id')
  @ApiOperation({ summary: 'Xem chi tiết một báo cáo hỏng hóc' })
  findOneEquipmentReport(@Param('id') id: string) {
    return this.facilitiesService.findOneEquipmentReport(+id);
  }

  @Patch('reports/:id')
  @Roles('AD', 'NV')
  @ApiOperation({ summary: 'Cập nhật/phê duyệt báo cáo hỏng hóc (Admin/Nhân viên)' })
  updateEquipmentReport(@Param('id') id: string, @Body() updateEquipmentReportDto: UpdateEquipmentReportDto) {
    return this.facilitiesService.updateEquipmentReport(+id, updateEquipmentReportDto);
  }

  @Delete('reports/:id')
  @Roles('AD')
  @ApiOperation({ summary: 'Xóa báo cáo hỏng hóc (Admin)' })
  removeEquipmentReport(@Param('id') id: string) {
    return this.facilitiesService.removeEquipmentReport(+id);
  }
}
