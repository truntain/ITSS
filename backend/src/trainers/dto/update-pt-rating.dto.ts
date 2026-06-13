import { PartialType } from '@nestjs/swagger';
import { CreatePtRatingDto } from './create-pt-rating.dto';

export class UpdatePtRatingDto extends PartialType(CreatePtRatingDto) {}
