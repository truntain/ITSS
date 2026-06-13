import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { User } from '../users/entities/user.entity';
import { Transaction } from '../payments/entities/transaction.entity';
import { Membership } from '../memberships/entities/membership.entity';
import { Package } from '../memberships/entities/package.entity';
import { Checkin } from '../checkins/entities/checkin.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Transaction, Membership, Package, Checkin])],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
