import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { FeedbacksService } from './feedbacks.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Feedbacks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('feedbacks')
export class FeedbacksController {
  constructor(private readonly feedbacksService: FeedbacksService) {}

  @Post()
  @Roles('HV')
  @ApiOperation({ summary: 'Hội viên gửi phản hồi góp ý mới (Member)' })
  create(@Body() createFeedbackDto: CreateFeedbackDto) {
    return this.feedbacksService.create(createFeedbackDto);
  }

  @Get('my-feedbacks')
  @Roles('HV')
  @ApiOperation({ summary: 'Xem danh sách phản hồi góp ý của bản thân hội viên' })
  findMyFeedbacks(@Request() req: any) {
    return this.feedbacksService.findMyFeedbacks(req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Xem toàn bộ danh sách phản hồi góp ý' })
  findAll() {
    return this.feedbacksService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Xem chi tiết phản hồi góp ý' })
  findOne(@Param('id') id: string) {
    return this.feedbacksService.findOne(+id);
  }

  @Patch(':id')
  @Roles('AD', 'NV')
  @ApiOperation({ summary: 'Ban quản lý trả lời phản hồi góp ý (Admin/Nhân viên)' })
  update(@Param('id') id: string, @Body() updateFeedbackDto: UpdateFeedbackDto) {
    return this.feedbacksService.update(+id, updateFeedbackDto);
  }

  @Delete(':id')
  @Roles('AD')
  @ApiOperation({ summary: 'Xóa bản ghi phản hồi (Admin)' })
  remove(@Param('id') id: string) {
    return this.feedbacksService.remove(+id);
  }
}
