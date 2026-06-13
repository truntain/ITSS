import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePtEvaluationDto } from './dto/create-pt-evaluation.dto';
import { UpdatePtEvaluationDto } from './dto/update-pt-evaluation.dto';
import { CreatePtRatingDto } from './dto/create-pt-rating.dto';
import { UpdatePtRatingDto } from './dto/update-pt-rating.dto';
import { CreateWorkoutPlanDto } from './dto/create-workout-plan.dto';
import { UpdateWorkoutPlanDto } from './dto/update-workout-plan.dto';
import { PtEvaluation } from './entities/pt-evaluation.entity';
import { PtRating } from './entities/pt-rating.entity';
import { WorkoutPlan } from './entities/workout-plan.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class TrainersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(PtEvaluation)
    private readonly evaluationRepository: Repository<PtEvaluation>,
    @InjectRepository(PtRating)
    private readonly ratingRepository: Repository<PtRating>,
    @InjectRepository(WorkoutPlan)
    private readonly workoutPlanRepository: Repository<WorkoutPlan>,
  ) {}

  // --- Trainers Profile CRUD (Users with role = 'PT') ---
  async findAllTrainers() {
    return this.userRepository.find({
      where: { role: 'PT', isActive: true },
      select: { id: true, email: true, fullName: true, phone: true, gender: true, avatar: true, isActive: true, createdAt: true },
      order: { fullName: 'ASC' },
    });
  }

  async findOneTrainer(id: number) {
    const pt = await this.userRepository.findOne({
      where: { id, role: 'PT' },
      select: { id: true, email: true, fullName: true, phone: true, gender: true, avatar: true, isActive: true, createdAt: true },
    });
    if (!pt) {
      throw new NotFoundException(`Không tìm thấy huấn luyện viên với ID #${id}`);
    }
    return pt;
  }

  // --- PtEvaluation CRUD ---
  async createEvaluation(dto: CreatePtEvaluationDto) {
    // Validate PT exists
    await this.findOneTrainer(dto.ptId);
    // Validate trainee exists
    const trainee = await this.userRepository.findOne({ where: { id: dto.traineeId } });
    if (!trainee) {
      throw new BadRequestException(`Không tìm thấy học viên với ID #${dto.traineeId}`);
    }

    const evaluation = this.evaluationRepository.create(dto);
    return this.evaluationRepository.save(evaluation);
  }

  async findAllEvaluations() {
    return this.evaluationRepository.find({
      relations: { pt: true, trainee: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOneEvaluation(id: number) {
    const evaluation = await this.evaluationRepository.findOne({
      where: { id },
      relations: { pt: true, trainee: true },
    });
    if (!evaluation) {
      throw new NotFoundException(`Không tìm thấy đánh giá tập luyện với ID #${id}`);
    }
    return evaluation;
  }

  async updateEvaluation(id: number, dto: UpdatePtEvaluationDto) {
    await this.findOneEvaluation(id);
    if (dto.ptId) await this.findOneTrainer(dto.ptId);
    if (dto.traineeId) {
      const trainee = await this.userRepository.findOne({ where: { id: dto.traineeId } });
      if (!trainee) throw new BadRequestException(`Không tìm thấy học viên với ID #${dto.traineeId}`);
    }
    await this.evaluationRepository.update(id, dto);
    return this.findOneEvaluation(id);
  }

  async removeEvaluation(id: number) {
    const evaluation = await this.findOneEvaluation(id);
    await this.evaluationRepository.remove(evaluation);
    return { message: 'Xóa đánh giá tập luyện thành công' };
  }

  // --- PtRating CRUD ---
  async createRating(dto: CreatePtRatingDto) {
    await this.findOneTrainer(dto.ptId);
    const user = await this.userRepository.findOne({ where: { id: dto.userId } });
    if (!user) {
      throw new BadRequestException(`Không tìm thấy người dùng chấm điểm với ID #${dto.userId}`);
    }

    const rating = this.ratingRepository.create(dto);
    return this.ratingRepository.save(rating);
  }

  async findAllRatings() {
    return this.ratingRepository.find({
      relations: { user: true, pt: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOneRating(id: number) {
    const rating = await this.ratingRepository.findOne({
      where: { id },
      relations: { user: true, pt: true },
    });
    if (!rating) {
      throw new NotFoundException(`Không tìm thấy đánh giá chất lượng PT với ID #${id}`);
    }
    return rating;
  }

  async updateRating(id: number, dto: UpdatePtRatingDto) {
    await this.findOneRating(id);
    if (dto.ptId) await this.findOneTrainer(dto.ptId);
    if (dto.userId) {
      const user = await this.userRepository.findOne({ where: { id: dto.userId } });
      if (!user) throw new BadRequestException(`Không tìm thấy người dùng với ID #${dto.userId}`);
    }
    await this.ratingRepository.update(id, dto);
    return this.findOneRating(id);
  }

  async removeRating(id: number) {
    const rating = await this.findOneRating(id);
    await this.ratingRepository.remove(rating);
    return { message: 'Xóa đánh giá chất lượng PT thành công' };
  }

  // --- WorkoutPlan CRUD ---
  async createWorkoutPlan(dto: CreateWorkoutPlanDto) {
    await this.findOneTrainer(dto.ptId);
    const trainee = await this.userRepository.findOne({ where: { id: dto.traineeId } });
    if (!trainee) {
      throw new BadRequestException(`Không tìm thấy học viên với ID #${dto.traineeId}`);
    }

    const plan = this.workoutPlanRepository.create(dto);
    return this.workoutPlanRepository.save(plan);
  }

  async findAllWorkoutPlans() {
    return this.workoutPlanRepository.find({
      relations: { pt: true, trainee: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOneWorkoutPlan(id: number) {
    const plan = await this.workoutPlanRepository.findOne({
      where: { id },
      relations: { pt: true, trainee: true },
    });
    if (!plan) {
      throw new NotFoundException(`Không tìm thấy giáo án bài tập với ID #${id}`);
    }
    return plan;
  }

  async updateWorkoutPlan(id: number, dto: UpdateWorkoutPlanDto) {
    await this.findOneWorkoutPlan(id);
    if (dto.ptId) await this.findOneTrainer(dto.ptId);
    if (dto.traineeId) {
      const trainee = await this.userRepository.findOne({ where: { id: dto.traineeId } });
      if (!trainee) throw new BadRequestException(`Không tìm thấy học viên với ID #${dto.traineeId}`);
    }
    await this.workoutPlanRepository.update(id, dto);
    return this.findOneWorkoutPlan(id);
  }

  async removeWorkoutPlan(id: number) {
    const plan = await this.findOneWorkoutPlan(id);
    await this.workoutPlanRepository.remove(plan);
    return { message: 'Xóa giáo án bài tập thành công' };
  }
}
