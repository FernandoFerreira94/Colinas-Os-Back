import { IsBoolean, IsDate, IsInt, IsString, MinLength } from 'class-validator';
import type {
  EquipeProps,
  FuncaoProps,
  PlantaoProps,
} from '../entities/user.entity';
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @IsString()
  @MinLength(4, { message: 'O nome deve ter pelo menos 4 caracteres' })
  readonly nameFull: string;

  @IsInt()
  readonly matricula: number;

  @IsString()
  readonly funcao: FuncaoProps;

  @IsBoolean()
  readonly is_admin: boolean;

  @IsBoolean()
  readonly is_almoxarife: boolean;

  @IsString()
  readonly plantao: PlantaoProps;

  @IsDate()
  @Transform(({ value }) => new Date(value))
  readonly date_register: Date;

  @IsString()
  @MinLength(11, { message: 'O CPF deve ter pelo menos 11 numeros' })
  readonly cpf: string;

  @IsString()
  @MinLength(1, { message: 'A equipe deve ter pelo menos 1 "A" ou "B"' })
  readonly equipe: EquipeProps;
}
