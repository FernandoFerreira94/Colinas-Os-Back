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
import { IsString, IsUrl } from 'class-validator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

class UpdateMaterialFotoDto {
  @IsString()
  @IsUrl()
  foto_url: string;
}
import { MaterialService } from './material.service';
import { CreateMaterialDto } from './dto/createMaterial.dto';
import { UpdateMaterialDto } from './dto/updateMaterial.dto';
import { FiltrarMaterialDto } from './dto/filtrar-material.dto';

@Controller('materiais')
export class MaterialController {
  constructor(private readonly materialService: MaterialService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateMaterialDto) {
    return this.materialService.createMaterial(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() filtros: FiltrarMaterialDto) {
    return this.materialService.findAll(filtros);
  }

  @UseGuards(JwtAuthGuard)
  @Get('estoque-baixo')
  findMateriaisEstoqueBaixo() {
    return this.materialService.findMateriaisEstoqueBaixo();
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/foto')
  updateFoto(@Param('id') id: string, @Body() body: UpdateMaterialFotoDto) {
    return this.materialService.updateFoto(id, body.foto_url);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.materialService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMaterialDto) {
    return this.materialService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.materialService.remove(id);
  }
}
