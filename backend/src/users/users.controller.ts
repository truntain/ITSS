import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('members')
  @Roles('AD', 'NV')
  @ApiOperation({ summary: 'Lấy danh sách tất cả hội viên (role HV)' })
  findAllMembers() {
    return this.usersService.findAllMembers();
  }

  @Get('members-detailed')
  @Roles('AD', 'NV')
  @ApiOperation({ summary: 'Lấy danh sách tất cả hội viên kèm thông tin chi tiết (gói tập, lịch sử)' })
  findAllMembersDetailed() {
    return this.usersService.findAllMembersDetailed();
  }

  @Post('members')
  @Roles('AD', 'NV')
  @ApiOperation({ summary: 'Tạo hội viên mới' })
  createMember(@Body() createMemberDto: CreateMemberDto) {
    return this.usersService.createMember(createMemberDto);
  }

  @Patch('members/:id')
  @Roles('AD', 'NV')
  @ApiOperation({ summary: 'Cập nhật thông tin hội viên' })
  updateMember(@Param('id') id: string, @Body() updateMemberDto: UpdateMemberDto) {
    return this.usersService.updateMember(+id, updateMemberDto);
  }
}
