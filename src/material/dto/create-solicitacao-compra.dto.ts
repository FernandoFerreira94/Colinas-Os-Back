import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum TipoItemSolicitacao {
  CADASTRADO = 'CADASTRADO',
  NAO_CADASTRADO = 'NAO_CADASTRADO',
}

export class CreateItemSolicitacaoDto {
  @IsEnum(TipoItemSolicitacao)
  tipo: TipoItemSolicitacao;

  @IsOptional()
  @IsString()
  material_id?: string;

  @IsOptional()
  @IsString()
  nome?: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsString()
  unidade?: string;

  @IsOptional()
  @IsString()
  imagem_url?: string;

  @IsNumber()
  @Min(0.001)
  @Type(() => Number)
  quantidade: number;
}

export class CreateSolicitacaoCompraDto {
  @IsOptional()
  @IsString()
  os_id?: string;

  @IsOptional()
  @IsString()
  preventiva_id?: string;

  @IsOptional()
  @IsString()
  observacao?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateItemSolicitacaoDto)
  itens: CreateItemSolicitacaoDto[];
}
