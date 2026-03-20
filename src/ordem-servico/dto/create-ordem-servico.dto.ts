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

  @IsUUID()
  @IsOptional()
  tecnico_id?: string; // ✅ adicionar de volta como opcional

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
  categoria?: string;

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
  @IsUUID('4', { each: true })
  @IsOptional()
  equipamentos_ids?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  fotos?: string[];
}
