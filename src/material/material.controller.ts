// material.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { MaterialService } from './material.service';
import { CreateMaterialDto } from './dto/createMaterial.dto';
import { UpdateMaterialDto } from './dto/updateMaterial.dto';
import { FiltrarMaterialDto } from './dto/filtrar-material.dto';

@Controller('materiais')
export class MaterialController {
  constructor(private readonly materialService: MaterialService) {}

  @Post()
  create(@Body() dto: CreateMaterialDto) {
    return this.materialService.createMaterial(dto);
  }

  @Get()
  findAll(@Query() filtros: FiltrarMaterialDto) {
    return this.materialService.findAll(filtros);
  }

  // Rota específica ANTES de /:id
  @UseGuards(JwtAuthGuard)
  @Get('para-baixa')
  findMateriaisParaBaixa() {
    return this.materialService.findMateriaisParaBaixa();
  }

  @UseGuards(JwtAuthGuard)
  @Get('estoque-baixo')
  findMateriaisEstoqueBaixo() {
    return this.materialService.findMateriaisEstoqueBaixo();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.materialService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMaterialDto) {
    return this.materialService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.materialService.remove(id);
  }
}
