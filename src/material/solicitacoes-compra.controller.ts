import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateItemSolicitacaoDto, CreateSolicitacaoCompraDto } from './dto/create-solicitacao-compra.dto';
import { MaterialService } from './material.service';

class UpdateSolicitacaoStatusDto {
  @IsEnum(['APROVAR', 'RECUSAR'])
  acao: 'APROVAR' | 'RECUSAR';

  @IsOptional()
  @IsString()
  observacao?: string;
}

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

  @Get('os/:osId')
  findByOs(@Param('osId') osId: string) {
    return this.materialService.findSolicitacoesCompraByOs(osId);
  }

  @Delete('items/:itemId')
  @HttpCode(HttpStatus.OK)
  removeItem(@Param('itemId') itemId: string) {
    return this.materialService.removeItemFromSolicitacao(itemId);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateSolicitacaoStatusDto,
    @CurrentUser() user: { sub: string },
  ) {
    return this.materialService.updateSolicitacaoStatus(
      id,
      dto.acao,
      user.sub,
      dto.observacao,
    );
  }

  @Post(':id/items')
  addItem(
    @Param('id') id: string,
    @Body() dto: CreateItemSolicitacaoDto,
  ) {
    return this.materialService.addItemToSolicitacao(id, dto);
  }
}
