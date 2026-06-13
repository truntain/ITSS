import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { MembershipsService } from './memberships.service';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { UpdateMembershipDto } from './dto/update-membership.dto';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Memberships')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('memberships')
export class MembershipsController {
  constructor(private readonly membershipsService: MembershipsService) {}

  // --- Packages Endpoints ---
  @Post('packages')
  @Roles('AD')
  @ApiOperation({ summary: 'Tạo gói tập mới (Admin)' })
  createPackage(@Body() createPackageDto: CreatePackageDto) {
    return this.membershipsService.createPackage(createPackageDto);
  }

  @Get('packages')
  @ApiOperation({ summary: 'Xem danh sách tất cả gói tập' })
  findAllPackages() {
    return this.membershipsService.findAllPackages();
  }

  @Get('packages/:id')
  @ApiOperation({ summary: 'Xem thông tin chi tiết một gói tập' })
  findOnePackage(@Param('id') id: string) {
    return this.membershipsService.findOnePackage(id);
  }

  @Patch('packages/:id')
  @Roles('AD')
  @ApiOperation({ summary: 'Cập nhật thông tin gói tập (Admin)' })
  updatePackage(@Param('id') id: string, @Body() updatePackageDto: UpdatePackageDto) {
    return this.membershipsService.updatePackage(id, updatePackageDto);
  }

  @Delete('packages/:id')
  @Roles('AD')
  @ApiOperation({ summary: 'Xóa gói tập (Admin)' })
  removePackage(@Param('id') id: string) {
    return this.membershipsService.removePackage(id);
  }

  // --- Memberships Endpoints ---
  @Post()
  @Roles('AD', 'NV', 'HV')
  @ApiOperation({ summary: 'Đăng ký/Mua gói tập (Admin/Nhân viên/Hội viên)' })
  create(@Body() createMembershipDto: CreateMembershipDto) {
    return this.membershipsService.create(createMembershipDto);
  }

  @Get()
  @Roles('AD', 'NV')
  @ApiOperation({ summary: 'Xem danh sách toàn bộ đăng ký hội viên (Admin/Nhân viên)' })
  findAll() {
    return this.membershipsService.findAll();
  }

  @Get(':id')
  @Roles('AD', 'NV', 'HV')
  @ApiOperation({ summary: 'Xem thông tin chi tiết một đăng ký hội viên' })
  findOne(@Param('id') id: string) {
    return this.membershipsService.findOne(+id);
  }

  @Patch(':id')
  @Roles('AD', 'NV')
  @ApiOperation({ summary: 'Cập nhật thông tin đăng ký hội viên (Admin/Nhân viên)' })
  update(@Param('id') id: string, @Body() updateMembershipDto: UpdateMembershipDto) {
    return this.membershipsService.update(+id, updateMembershipDto);
  }

  @Delete(':id')
  @Roles('AD')
  @ApiOperation({ summary: 'Xóa đăng ký hội viên (Admin)' })
  remove(@Param('id') id: string) {
    return this.membershipsService.remove(+id);
  }
}
