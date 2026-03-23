import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Complexo } from '@prisma/client';

export class FiltrarMaterialDto {
  @IsOptional()
  @IsEnum(Complexo)
  departamento?: Complexo;

  @IsOptional()
  @IsString()
  categoria_id?: string;

  @IsOptional()
  @IsString()
  subcategoria_id?: string;

  @IsOptional()
  @IsString()
  nome?: string;
}
