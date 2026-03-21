import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateSolicitacaoCompraDto } from './dto/create-solicitacao-compra.dto';
import { MaterialService } from './material.service';

@UseGuards(JwtAuthGuard)
@Controller('solicitacoes-compra')
export class SolicitacoesCompraController {
  constructor(private readonly materialService: MaterialService) {}

  @Post()
  create(
    @Body() dto: CreateSolicitacaoCompraDto,
    @CurrentUser() user: { sub: string },
  ) {
    return this.materialService.createSolicitacaoCompra(dto, user.sub);
  }

  @Get()
  findAll() {
    return this.materialService.findSolicitacoesPendentes();
  }
}
