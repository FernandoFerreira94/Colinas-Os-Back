import { IsInt, IsString } from 'class-validator';

export class AuthDto {
  @IsInt()
  matricula: number;

  @IsString()
  password: string;
}
