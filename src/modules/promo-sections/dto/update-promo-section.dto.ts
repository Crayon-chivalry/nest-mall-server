import { PartialType } from '@nestjs/swagger';
import { CreatePromoSectionDto } from './create-promo-section.dto';

export class UpdatePromoSectionDto extends PartialType(CreatePromoSectionDto) {}
