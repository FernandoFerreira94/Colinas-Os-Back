import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { StatusOS, TipoOS } from '@prisma/client';
import { CreateOrdemServicoDto } from './dto/create-ordem-servico.dto';
import { UpdateOrdemServicoDto } from './dto/update-ordem-servico.dto';
import { UpdateStatusOsDto } from './dto/update-status-os.dto';
import { OrdemServicoService } from './ordem-servico.service';

@Controller('ordem-servico')
export class OrdemServicoController {
  constructor(private readonly ordemServicoService: OrdemServicoService) {}

  @Get()
  findAll() {
    return this.ordemServicoService.findAll();
  }

  @Get('status/:status')
  findByStatus(@Param('status') status: StatusOS) {
    return this.ordemServicoService.findByStatus(status);
  }

  @Get('tipo/:tipo')
  findByTipo(@Param('tipo') tipo: TipoOS) {
    return this.ordemServicoService.findByTipo(tipo);
  }

  @Get('categoria/:categoria')
  findByCategoria(@Param('categoria') categoria: string) {
    return this.ordemServicoService.findByCategoria(categoria);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordemServicoService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateOrdemServicoDto) {
    return this.ordemServicoService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateOrdemServicoDto) {
    return this.ordemServicoService.update(id, dto);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusOsDto) {
    return this.ordemServicoService.updateStatus(id, dto);
  }

  @Post(':id/equipamento')
  addEquipamento(
    @Param('id') id: string,
    @Body('equipamento_id') equipamentoId: string,
  ) {
    return this.ordemServicoService.addEquipamento(id, equipamentoId);
  }

  @Delete(':id/equipamento/:equipamentoId')
  removeEquipamento(
    @Param('id') id: string,
    @Param('equipamentoId') equipamentoId: string,
  ) {
    return this.ordemServicoService.removeEquipamento(id, equipamentoId);
  }

  @Post(':id/apoio')
  addApoio(@Param('id') id: string, @Body('user_id') userId: string) {
    return this.ordemServicoService.addApoio(id, userId);
  }

  @Delete(':id/apoio/:userId')
  removeApoio(@Param('id') id: string, @Param('userId') userId: string) {
    return this.ordemServicoService.removeApoio(id, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordemServicoService.remove(id);
  }
}
