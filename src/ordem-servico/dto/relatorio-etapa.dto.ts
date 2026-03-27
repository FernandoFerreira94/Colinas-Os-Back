import { IsArray, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class RelatorioEtapaDto {
  @IsString()
  @IsNotEmpty()
  relatorio: string;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  apoio_ids?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  fotos?: string[];
}
