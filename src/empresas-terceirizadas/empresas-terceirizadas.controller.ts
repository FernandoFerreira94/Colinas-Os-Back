import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateEmpresaTerceirizadaDto } from './dto/create-empresa-terceirizada.dto';
import { UpdateEmpresaTerceirizadaDto } from './dto/update-empresa-terceirizada.dto';
import { EmpresasTerceirizadasService } from './empresas-terceirizadas.service';

@Controller('empresas-terceirizadas')
export class EmpresasTerceirizadasController {
  constructor(
    private readonly empresasTerceirizadasService: EmpresasTerceirizadasService,
  ) {}

  @Get()
  findAll() {
    return this.empresasTerceirizadasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.empresasTerceirizadasService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateEmpresaTerceirizadaDto) {
    return this.empresasTerceirizadasService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEmpresaTerceirizadaDto) {
    return this.empresasTerceirizadasService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.empresasTerceirizadasService.remove(id);
  }
}
