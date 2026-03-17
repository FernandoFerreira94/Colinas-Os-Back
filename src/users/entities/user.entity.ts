import { FuncaoUser, Plantao } from '@prisma/client';

export class User {
  readonly id: string;
  readonly ativo: boolean;
  readonly nameFull: string;
  readonly matricula: number;
  readonly funcao: FuncaoUser;
  readonly is_admin: boolean;
  readonly cpf: string;
  readonly equipe: EquipeProps;
  readonly is_almoxarife: boolean;
  readonly date_termination?: Date | null;
  readonly date_register: Date;
  readonly created_at?: Date | null;
  readonly plantao: Plantao;
  readonly os_finalizadas: number;
  readonly os_apoio: number;
}

export type EquipeProps = 'A' | 'B';
