import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { User } from '../users/entities/user.entity';
import { Membership } from '../memberships/entities/membership.entity';
import { Checkin } from '../checkins/entities/checkin.entity';
import { BodyRecord } from '../body-records/entities/body-record.entity';
import { Package } from '../memberships/entities/package.entity';
import { Transaction } from '../payments/entities/transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Membership,
      Checkin,
      BodyRecord,
      Package,
      Transaction,
    ]),
  ],
  controllers: [CustomersController],
  providers: [CustomersService],
  exports: [CustomersService],
})
export class CustomersModule { }
