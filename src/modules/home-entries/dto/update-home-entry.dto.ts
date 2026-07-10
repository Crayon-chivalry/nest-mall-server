import { PartialType } from '@nestjs/swagger';
import { CreateHomeEntryDto } from './create-home-entry.dto';

export class UpdateHomeEntryDto extends PartialType(CreateHomeEntryDto) {}
