import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateFirearmDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  make: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  model: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  caliber: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  serialNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
