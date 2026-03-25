import {
  IsEnum,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Prioridade } from '@prisma/client';

export class CreatePreventivaDto {
  @IsString()
  equipamento_id: string;

  @IsOptional()
  @IsString()
  checklist_id?: string;

  @IsInt()
  @Min(1)
  frequencia_dias: number;

  @IsOptional()
  @IsISO8601()
  data_inicio?: string; // Se não informada, calcula a partir de hoje

  @IsOptional()
  @IsEnum(Prioridade)
  prioridade?: Prioridade;
}
