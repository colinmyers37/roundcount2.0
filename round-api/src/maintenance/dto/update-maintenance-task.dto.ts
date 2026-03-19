import { IsString, IsInt, IsOptional, Min, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateMaintenanceTaskDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  intervalRounds?: number;
}
