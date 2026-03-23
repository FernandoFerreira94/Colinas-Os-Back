import {
  IsArray,
  IsInt,
  IsPositive,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateItemMaterialGastoDto {
  @IsUUID()
  material_id: string;

  @IsInt()
  @IsPositive()
  @Min(1)
  @Type(() => Number)
  quantidade: number;
}

export class CreateMaterialGastoDto {
  @IsUUID()
  os_id: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateItemMaterialGastoDto)
  itens: CreateItemMaterialGastoDto[];
}
