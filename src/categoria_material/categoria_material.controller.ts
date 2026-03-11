// ─── categoria-material.controller.ts ────────────────────────────────────────
import { Body, Controller, Get, Post } from '@nestjs/common';
import { CategoriaMaterialService } from './categoria_material.service';
import { CreateCategoriaDto } from './dto/createCategoriaMaterial.dto';
import { CreateSubCategoriaDto } from './dto/createSubCategoria.dto';

@Controller('categoria-material')
export class CategoriaMaterialController {
  constructor(private readonly service: CategoriaMaterialService) {}

  // POST /categoria-material/categoria
  @Post('categoria')
  createCategoria(@Body() dto: CreateCategoriaDto) {
    return this.service.createCategoria(dto);
  }

  // POST /categoria-material/sub-categoria
  @Post('sub-categoria')
  createSubCategoria(@Body() dto: CreateSubCategoriaDto) {
    return this.service.createSubCategoria(dto);
  }

  @Get('all')
  findCategoriaAll() {
    return this.service.findCategoriaAll();
  }
  @Get('sub/all')
  findSubCategoriaAll() {
    return this.service.findSubCategoriaAll();
  }
}
