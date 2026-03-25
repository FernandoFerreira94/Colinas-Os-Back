import { Complexo, Prioridade, TipoOS } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

function emptyToUndefined({ value }: { value: unknown }) {
  return value === '' ? undefined : value;
}

export class CreateOrdemServicoDto {
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsUUID()
  @IsOptional()
  tecnico_id?: string; // ✅ adicionar de volta como opcional

  @Transform(emptyToUndefined)
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

  @Transform(emptyToUndefined)
  @IsString()
  @IsOptional()
  categoria?: string;

  @Transform(emptyToUndefined)
  @IsString()
  @IsOptional()
  empresa_nome?: string;

  @Transform(emptyToUndefined)
  @IsString()
  @IsOptional()
  tecnico_externo?: string;

  @Transform(emptyToUndefined)
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
