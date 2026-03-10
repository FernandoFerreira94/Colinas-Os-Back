import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class Create_EquipamentoDto {
  @IsBoolean()
  ativo: boolean;

  @IsString()
  @IsNotEmpty()
  tag: string; // ex: "AC", "GE", "BBA"

  @IsInt()
  @Min(1)
  num_tag: number; // ex: 1, 2, 3

  @IsString()
  @IsNotEmpty()
  name_equipamento: string;

  @IsString()
  @IsNotEmpty()
  categoria_id: string;

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
  @IsNotEmpty()
  descricao: string;

  @IsString()
  @IsOptional()
  file_equipamento?: string;
}
