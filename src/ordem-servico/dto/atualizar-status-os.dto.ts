import { IsNotEmpty, IsString } from 'class-validator';

export class AtualizarStatusOsDto {
  @IsString()
  @IsNotEmpty()
  relatorio: string;
}
