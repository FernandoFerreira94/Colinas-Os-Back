// dto/update-material.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateMaterialDto } from './createMaterial.dto';

export class UpdateMaterialDto extends PartialType(CreateMaterialDto) {}
