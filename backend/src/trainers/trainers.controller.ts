import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TrainersService } from './trainers.service';
import { CreatePtEvaluationDto } from './dto/create-pt-evaluation.dto';
import { UpdatePtEvaluationDto } from './dto/update-pt-evaluation.dto';
import { CreatePtRatingDto } from './dto/create-pt-rating.dto';
import { UpdatePtRatingDto } from './dto/update-pt-rating.dto';
import { CreateWorkoutPlanDto } from './dto/create-workout-plan.dto';
import { UpdateWorkoutPlanDto } from './dto/update-workout-plan.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Trainers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('trainers')
export class TrainersController {
  constructor(private readonly trainersService: TrainersService) {}

  // --- Trainers Profile Endpoints ---
  @Get()
  @ApiOperation({ summary: 'Xem danh sách huấn luyện viên (PT)' })
  findAllTrainers() {
    return this.trainersService.findAllTrainers();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Xem thông tin chi tiết một huấn luyện viên' })
  findOneTrainer(@Param('id') id: string) {
    return this.trainersService.findOneTrainer(+id);
  }

  // --- PtEvaluation Endpoints ---
  @Post('evaluations')
  @Roles('PT')
  @ApiOperation({ summary: 'Tạo đánh giá tập luyện học viên (PT)' })
  createEvaluation(@Body() dto: CreatePtEvaluationDto) {
    return this.trainersService.createEvaluation(dto);
  }

  @Get('evaluations/all')
  @ApiOperation({ summary: 'Xem danh sách tất cả đánh giá tập luyện' })
  findAllEvaluations() {
    return this.trainersService.findAllEvaluations();
  }

  @Get('evaluations/trainee/:traineeId')
  @Roles('AD', 'PT', 'HV')
  @ApiOperation({ summary: 'Xem các đánh giá tập luyện của một học viên cụ thể' })
  findEvaluationsByTrainee(@Param('traineeId') traineeId: string) {
    return this.trainersService.findEvaluationsByTrainee(+traineeId);
  }

  @Get('evaluations/:id')
  @ApiOperation({ summary: 'Xem thông tin chi tiết một đánh giá tập luyện' })
  findOneEvaluation(@Param('id') id: string) {
    return this.trainersService.findOneEvaluation(+id);
  }

  @Patch('evaluations/:id')
  @Roles('PT')
  @ApiOperation({ summary: 'Cập nhật thông tin đánh giá tập luyện (PT)' })
  updateEvaluation(@Param('id') id: string, @Body() dto: UpdatePtEvaluationDto) {
    return this.trainersService.updateEvaluation(+id, dto);
  }

  @Delete('evaluations/:id')
  @Roles('AD', 'PT')
  @ApiOperation({ summary: 'Xóa đánh giá tập luyện (Admin/PT)' })
  removeEvaluation(@Param('id') id: string) {
    return this.trainersService.removeEvaluation(+id);
  }

  // --- PtRating Endpoints ---
  @Post('ratings')
  @Roles('HV')
  @ApiOperation({ summary: 'Đánh giá chất lượng huấn luyện viên (Hội viên)' })
  createRating(@Body() dto: CreatePtRatingDto) {
    return this.trainersService.createRating(dto);
  }

  @Get('ratings/all')
  @ApiOperation({ summary: 'Xem danh sách tất cả đánh giá chất lượng PT' })
  findAllRatings() {
    return this.trainersService.findAllRatings();
  }

  @Get('ratings/:id')
  @ApiOperation({ summary: 'Xem chi tiết một đánh giá chất lượng PT' })
  findOneRating(@Param('id') id: string) {
    return this.trainersService.findOneRating(+id);
  }

  @Patch('ratings/:id')
  @Roles('HV')
  @ApiOperation({ summary: 'Cập nhật đánh giá chất lượng PT (Hội viên)' })
  updateRating(@Param('id') id: string, @Body() dto: UpdatePtRatingDto) {
    return this.trainersService.updateRating(+id, dto);
  }

  @Delete('ratings/:id')
  @Roles('AD', 'HV')
  @ApiOperation({ summary: 'Xóa đánh giá chất lượng PT (Admin/Hội viên)' })
  removeRating(@Param('id') id: string) {
    return this.trainersService.removeRating(+id);
  }

  // --- WorkoutPlan Endpoints ---
  @Post('workout-plans')
  @Roles('PT')
  @ApiOperation({ summary: 'Giao giáo án tập luyện mới cho học viên (PT)' })
  createWorkoutPlan(@Body() dto: CreateWorkoutPlanDto) {
    return this.trainersService.createWorkoutPlan(dto);
  }

  @Get('workout-plans/all')
  @ApiOperation({ summary: 'Xem danh sách tất cả giáo án bài tập' })
  findAllWorkoutPlans() {
    return this.trainersService.findAllWorkoutPlans();
  }

  @Get('workout-plans/trainer/:ptId')
  @Roles('PT', 'AD')
  @ApiOperation({ summary: 'Xem danh sách giáo án của huấn luyện viên cụ thể' })
  findWorkoutPlansByPt(@Param('ptId') ptId: string) {
    return this.trainersService.findWorkoutPlansByPt(+ptId);
  }

  @Get('workout-plans/:id')
  @ApiOperation({ summary: 'Xem chi tiết một giáo án tập luyện' })
  findOneWorkoutPlan(@Param('id') id: string) {
    return this.trainersService.findOneWorkoutPlan(+id);
  }

  @Patch('workout-plans/:id')
  @Roles('PT')
  @ApiOperation({ summary: 'Cập nhật thông tin giáo án tập luyện (PT)' })
  updateWorkoutPlan(@Param('id') id: string, @Body() dto: UpdateWorkoutPlanDto) {
    return this.trainersService.updateWorkoutPlan(+id, dto);
  }

  @Delete('workout-plans/:id')
  @Roles('AD', 'PT')
  @ApiOperation({ summary: 'Xóa giáo án tập luyện (Admin/PT)' })
  removeWorkoutPlan(@Param('id') id: string) {
    return this.trainersService.removeWorkoutPlan(+id);
  }
}
