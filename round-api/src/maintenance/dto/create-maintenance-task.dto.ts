import { IsString, IsInt, Min, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMaintenanceTaskDto {
  @IsString()
  firearmId: string;

  @IsString()
  @MaxLength(200)
  name: string;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  intervalRounds: number;
}
