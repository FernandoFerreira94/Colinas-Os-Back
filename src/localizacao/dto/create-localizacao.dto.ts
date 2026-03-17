import { Complexo } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateLocalizacaoDto {
  @IsEnum(Complexo)
  @IsNotEmpty()
  complexo: Complexo;

  @IsString()
  @IsNotEmpty()
  andar: string;

  @IsString()
  @IsOptional()
  area?: string;
}
