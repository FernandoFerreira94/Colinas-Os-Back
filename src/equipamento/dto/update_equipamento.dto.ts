import { PartialType } from '@nestjs/mapped-types';
import { Create_EquipamentoDto } from './create_equipamento.dto';

export class UpdateEquipamentoDto extends PartialType(Create_EquipamentoDto) {}
