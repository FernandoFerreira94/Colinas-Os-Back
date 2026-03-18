import { StatusOS } from '@prisma/client';
import { PartialType } from '@nestjs/mapped-types';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { CreateOrdemServicoDto } from './create-ordem-servico.dto';

export class UpdateOrdemServicoDto extends PartialType(CreateOrdemServicoDto) {
  @IsEnum(StatusOS)
  @IsOptional()
  status?: StatusOS;

  @IsString()
  @IsOptional()
  observacao_fiscal?: string;

  @IsDateString()
  @IsOptional()
  finalizada_at?: string;
}
