import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class Create_EquipamentoDto {
  @IsBoolean()
  @IsOptional()
  ativo?: boolean;

  @IsString()
  @IsNotEmpty()
  name_equipamento: string;

  @IsInt()
  @IsNotEmpty()
  num_tag: number;

  @IsUUID()
  @IsNotEmpty()
  categoria_id: string;

  @IsUUID()
  @IsOptional()
  localizacao_id?: string;

  @IsUUID()
  @IsOptional()
  empresa_id?: string;

  @IsString()
  @IsOptional()
  modelo?: string;

  @IsString()
  @IsOptional()
  fabricante?: string;

  @IsString()
  @IsOptional()
  local_instalacao?: string;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  fotos?: string[];
}
