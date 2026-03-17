import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Complexo } from '@prisma/client';
import { CreateLocalizacaoDto } from './dto/create-localizacao.dto';
import { UpdateLocalizacaoDto } from './dto/update-localizacao.dto';
import { LocalizacaoService } from './localizacao.service';

@Controller('localizacao')
export class LocalizacaoController {
  constructor(private readonly localizacaoService: LocalizacaoService) {}

  @Get()
  findAll() {
    return this.localizacaoService.findAll();
  }

  @Get('complexo/:complexo')
  findByComplexo(@Param('complexo') complexo: Complexo) {
    return this.localizacaoService.findByComplexo(complexo);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.localizacaoService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateLocalizacaoDto) {
    return this.localizacaoService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLocalizacaoDto) {
    return this.localizacaoService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.localizacaoService.remove(id);
  }
}
