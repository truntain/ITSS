import { PartialType } from '@nestjs/swagger';
import { CreatePtEvaluationDto } from './create-pt-evaluation.dto';

export class UpdatePtEvaluationDto extends PartialType(CreatePtEvaluationDto) {}
