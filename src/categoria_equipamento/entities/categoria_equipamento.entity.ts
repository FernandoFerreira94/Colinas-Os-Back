import { Categoria } from '@prisma/client';

export class Categoria_Equipamento {
  readonly id: string;
  readonly categoria: Categoria;
  readonly tag: string;
  readonly tipo: string;
  readonly created_at?: Date;
}
