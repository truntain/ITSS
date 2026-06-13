import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainersService } from './trainers.service';
import { TrainersController } from './trainers.controller';
import { PtEvaluation } from './entities/pt-evaluation.entity';
import { PtRating } from './entities/pt-rating.entity';
import { WorkoutPlan } from './entities/workout-plan.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, PtEvaluation, PtRating, WorkoutPlan])],
  controllers: [TrainersController],
  providers: [TrainersService],
  exports: [TrainersService],
})
export class TrainersModule {}
