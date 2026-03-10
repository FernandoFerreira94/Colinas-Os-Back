import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { EquipamentoService } from './equipamento.service';
import { Create_EquipamentoDto } from './dto/create_equipamento.det';

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
    return this.equipamentoService.getEquipamentos(filter);
  }

  @Post('create')
  createEquipamento(@Body() createEqupamento: Create_EquipamentoDto) {
    return this.equipamentoService.createEquipamento(createEqupamento);
  }

  @Delete('delete/:id')
  async deleteEquipamento(@Param('id') id: string) {
    return this.equipamentoService.deleteEquipamento(id);
  }
}
