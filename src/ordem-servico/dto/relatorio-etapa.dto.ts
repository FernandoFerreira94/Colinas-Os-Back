import { IsNotEmpty, IsString } from 'class-validator';

export class RelatorioEtapaDto {
  @IsString()
  @IsNotEmpty()
  relatorio: string;
}
