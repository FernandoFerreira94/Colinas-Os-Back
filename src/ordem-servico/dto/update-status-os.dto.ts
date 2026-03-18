import { StatusOS } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class UpdateStatusOsDto {
  @IsEnum(StatusOS)
  @IsNotEmpty()
  status: StatusOS;

  @IsUUID()
  @IsOptional()
  tecnico_id?: string;
}
