// dto/create-material.dto.ts
import {
  IsString,
  IsOptional,
  IsInt,
  IsEnum,
  IsNumber,
  MinLength,
  MaxLength,
  Min,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Complexo, Unidade } from '@prisma/client';

export class CreateMaterialDto {
  @IsString()
  @MinLength(2, { message: 'Código deve ter ao menos 2 caracteres' })
  @MaxLength(20, { message: 'Código muito longo' })
  codigo: string;

  @IsString()
  @MinLength(3, { message: 'Descrição obrigatória' })
  descricao: string;

  @IsString()
  @IsOptional()
  cor?: string;

  @IsInt({ message: 'Deve ser número inteiro' })
  @IsOptional()
  @Type(() => Number)
  quantidade_minima?: number;

  @IsString()
  @MinLength(1, { message: 'Selecione a sub categoria' })
  subcategoriaId: string;

  @IsEnum(Complexo, { message: 'Departamento inválido' })
  departamento: Complexo;

  @IsString()
  @IsOptional()
  marca?: string;

  @IsNumber({}, { message: 'Informe um preço válido' })
  @Type(() => Number)
  price: number;

  @IsInt({ message: 'Deve ser número inteiro' })
  @Min(0, { message: 'Quantidade não pode ser negativa' })
  @Type(() => Number)
  quantidade_estoque: number;

  @IsEnum(Unidade, { message: 'Selecione a unidade' })
  unidade: Unidade;

  @IsBoolean()
  @IsOptional()
  notificacao_ativa?: boolean;

  @IsString()
  @IsOptional()
  foto_url?: string;
}
