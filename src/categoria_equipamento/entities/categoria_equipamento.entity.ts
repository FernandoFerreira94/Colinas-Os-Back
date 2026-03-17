import { Categoria_Equipamento } from '@prisma/client';

export class Categoria_EquipamentoProps {
  readonly id: string;
  readonly categoria: Categoria_Equipamento;
  readonly tag: string;
  readonly tipo: string;
  readonly created_at?: Date;
}
