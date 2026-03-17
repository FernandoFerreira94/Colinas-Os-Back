import { IsString, MinLength } from 'class-validator';
import { CategoriaEquipamento } from '@prisma/client';

export class Create_Categoria_equipamentoDto {
  @IsString()
  readonly categoria: CategoriaEquipamento;

  @IsString()
  readonly tipo: string;

  @IsString()
  @MinLength(2, {
    message: 'Tag do equipamento deve ter pelo menos 2 caracteres',
  })
  readonly tag: string;
}
