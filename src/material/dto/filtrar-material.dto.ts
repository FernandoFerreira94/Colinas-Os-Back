import { IsOptional, IsString } from 'class-validator';

export class FiltrarMaterialDto {
  @IsOptional()
  @IsString()
  departamento?: string;

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
