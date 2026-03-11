// create_equipamento.dto.ts
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class Create_EquipamentoDto {
  @IsBoolean()
  @IsNotEmpty()
  ativo: boolean;

  @IsString()
  @IsNotEmpty()
  name_equipamento: string;

  @IsUUID()
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
  @IsOptional()
  descricao?: string;

  @IsString()
  @IsOptional()
  file_equipamento?: string;
}
