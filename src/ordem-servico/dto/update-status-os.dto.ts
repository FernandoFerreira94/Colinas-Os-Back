import { StatusOS } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateStatusOsDto {
  @IsEnum(StatusOS)
  @IsNotEmpty()
  status: StatusOS;

  @IsUUID()
  @IsOptional()
  tecnico_id?: string;

  @IsUUID()
  @IsOptional()
  atribuido_por_id?: string;

  @IsUUID()
  @IsOptional()
  usuario_id?: string;

  @IsString()
  @IsOptional()
  relatorio?: string;

  @IsString()
  @IsOptional()
  observacao_fiscal?: string;
}
