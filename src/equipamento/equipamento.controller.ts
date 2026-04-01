import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { IsString, IsUrl } from 'class-validator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { EquipamentoService } from './equipamento.service';
import { Create_EquipamentoDto } from './dto/create_equipamento.dto';
import { UpdateEquipamentoDto } from './dto/update_equipamento.dto';

class UpdateEquipamentoFotoDto {
  @IsString()
  @IsUrl()
  foto_url: string;
}

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

  @Patch(':id')
  updateEquipamento(
    @Param('id') id: string,
    @Body() updateDto: UpdateEquipamentoDto,
  ) {
    return this.equipamentoService.updateEquipamento(id, updateDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/foto')
  updateFoto(
    @Param('id') id: string,
    @Body() body: UpdateEquipamentoFotoDto,
  ) {
    return this.equipamentoService.updateFoto(id, body.foto_url);
  }

  @Delete('delete/:id')
  async deleteEquipamento(@Param('id') id: string) {
    return this.equipamentoService.deleteEquipamento(id);
  }
}
