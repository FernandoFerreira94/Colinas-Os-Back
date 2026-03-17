import { PartialType } from '@nestjs/mapped-types';
import { CreateEmpresaTerceirizadaDto } from './create-empresa-terceirizada.dto';

export class UpdateEmpresaTerceirizadaDto extends PartialType(
  CreateEmpresaTerceirizadaDto,
) {}
