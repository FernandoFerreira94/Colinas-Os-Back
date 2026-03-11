import { Categoria_Material } from '@prisma/client';

export class SubCategoria_Material {
  readonly id: string;
  readonly subCategoria: string;
  readonly categoria_id: string;
  readonly categoria?: Categoria_Material[];
}
