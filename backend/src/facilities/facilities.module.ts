import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacilitiesService } from './facilities.service';
import { FacilitiesController } from './facilities.controller';
import { Facility } from './entities/facility.entity';
import { Equipment } from './entities/equipment.entity';
import { EquipmentReport } from './entities/equipment-report.entity';
import { GymSetting } from './entities/gym-setting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Facility, Equipment, EquipmentReport, GymSetting])],
  controllers: [FacilitiesController],
  providers: [FacilitiesService],
  exports: [FacilitiesService],
})
export class FacilitiesModule {}
