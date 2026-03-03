import {
  IsBoolean,
  IsDate,
  IsInt,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { PartialType } from '@nestjs/mapped-types';
import { Transform } from 'class-transformer';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsBoolean()
  @IsOptional()
  readonly ativo: boolean;

  @IsDate()
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  readonly date_termination: Date;

  @IsString()
  @MinLength(6, { message: 'O nome deve ter pelo menos 4 caracteres' })
  @IsOptional()
  readonly password: string;

  @IsInt()
  @IsOptional()
  readonly os_finalizadas: number;

  @IsInt()
  @IsOptional()
  readonly os_apoio: number;
}
