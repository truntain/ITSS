import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BodyRecordsService } from './body-records.service';
import { BodyRecordsController } from './body-records.controller';
import { BodyRecord } from './entities/body-record.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BodyRecord])],
  controllers: [BodyRecordsController],
  providers: [BodyRecordsService],
  exports: [BodyRecordsService],
})
export class BodyRecordsModule {}
