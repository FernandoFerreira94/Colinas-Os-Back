import { PartialType } from '@nestjs/mapped-types';
import { CreatePreventivaDto } from './create-preventiva.dto';
import { IsEnum, IsISO8601, IsOptional, IsString } from 'class-validator';
import { StatusPreventiva } from '@prisma/client';

export class UpdatePreventivaDto extends PartialType(CreatePreventivaDto) {
  @IsOptional()
  @IsEnum(StatusPreventiva)
  status?: StatusPreventiva;

  @IsOptional()
  @IsISO8601()
  data_finalizada?: string;

  @IsOptional()
  @IsISO8601()
  data_agendada?: string;

  @IsOptional()
  checklist_resultado?: object;

  @IsOptional()
  @IsString()
  observacoes?: string;
}
