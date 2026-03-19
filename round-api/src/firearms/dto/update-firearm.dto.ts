import { PartialType } from '@nestjs/mapped-types';
import { CreateFirearmDto } from './create-firearm.dto';

export class UpdateFirearmDto extends PartialType(CreateFirearmDto) {}
