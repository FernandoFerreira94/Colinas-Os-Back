import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { EquipamentoService } from './equipamento.service';
import { Create_EquipamentoDto } from './dto/create_equipamento.dto';
import { UpdateEquipamentoDto } from './dto/update_equipamento.dto';

@Controller('equipamento')
export class EquipamentoController {
  constructor(private readonly equipamentoService: EquipamentoService) {}

  @Get('tag/:tag')
  async getTag(@Param('tag') tag: string) {
    return this.equipamentoService.getProximoNumTag(tag);
  }

  @Get('all')
  async getAllEquipamentos() {
    return this.equipamentoService.findAllEquipamentos();
  }

  @Get('filter')
  async getEquipamentos(@Query('filter') filter?: string) {
    return this.equipamentoService.getEquipamentosFilter(filter);
  }

  @Get(':id')
  getEquipamentoId(@Param('id') id: string) {
    return this.equipamentoService.getEquipamentoId(id);
  }

  @Post('create')
  createEquipamento(@Body() createEqupamento: Create_EquipamentoDto) {
    return this.equipamentoService.createEquipamento(createEqupamento);
  }

  // equipamento.controller.ts — adicione esse endpoint
  @Patch(':id')
  updateEquipamento(
    @Param('id') id: string,
    @Body() updateDto: UpdateEquipamentoDto,
  ) {
    return this.equipamentoService.updateEquipamento(id, updateDto);
  }

  @Delete('delete/:id')
  async deleteEquipamento(@Param('id') id: string) {
    return this.equipamentoService.deleteEquipamento(id);
  }
}
