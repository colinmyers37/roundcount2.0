import { IsString, IsInt, IsOptional, IsDateString, Min, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSessionDto {
  @IsString()
  firearmId: string;

  @IsDateString()
  date: string;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  roundsFired: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
