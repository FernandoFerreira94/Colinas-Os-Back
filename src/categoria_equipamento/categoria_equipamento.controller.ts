import { Body, Controller, Get, Post } from '@nestjs/common';
import { CategoriaEquipamentoService } from './categoria_equipamento.service';
import { Create_Categoria_equipamentoDto } from './dto/create_categoria_equipamento.dto';

@Controller('categoria-equipamento')
export class CategoriaEquipamentoController {
  constructor(
    private readonly categoriaEquipamentoService: CategoriaEquipamentoService,
  ) {}

  @Get('all')
  findAllCategoria() {
    return this.categoriaEquipamentoService.findCategoriaAll();
  }

  @Post('create')
  createCategoria_equipamento(
    @Body() createCategoria_equipamento: Create_Categoria_equipamentoDto,
  ) {
    return this.categoriaEquipamentoService.createCategoria_equipamento(
      createCategoria_equipamento,
    );
  }
}
