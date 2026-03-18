import { Complexo, Prioridade, TipoOS } from '@prisma/client';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateOrdemServicoDto {
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsEnum(TipoOS)
  @IsNotEmpty()
  tipo: TipoOS;

  @IsEnum(Prioridade)
  @IsOptional()
  prioridade?: Prioridade;

  @IsEnum(Complexo)
  @IsNotEmpty()
  complexo: Complexo;

  @IsUUID()
  @IsNotEmpty()
  criado_por_id: string;

  @IsUUID()
  @IsOptional()
  localizacao_id?: string;

  @IsUUID()
  @IsOptional()
  equipamento_id?: string;

  @IsUUID()
  @IsOptional()
  empresa_id?: string;

  @IsString()
  @IsOptional()
  empresa_nome?: string;

  @IsString()
  @IsOptional()
  tecnico_externo?: string;

  @IsString()
  @IsOptional()
  cargo_externo?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  fotos?: string[];
}
