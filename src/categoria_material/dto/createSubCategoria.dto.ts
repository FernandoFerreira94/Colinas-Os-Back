// ─── create-sub-categoria.dto.ts ─────────────────────────────────────────────
import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateSubCategoriaDto {
  @IsString()
  @IsNotEmpty()
  subCategoria: string;

  @IsUUID()
  @IsNotEmpty()
  categoria_id: string;
}
