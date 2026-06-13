import { PartialType } from '@nestjs/swagger';
import { CreateBodyRecordDto } from './create-body-record.dto';

export class UpdateBodyRecordDto extends PartialType(CreateBodyRecordDto) {}
