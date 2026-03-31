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
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import {
  CreateItemSolicitacaoDto,
  CreateSolicitacaoCompraDto,
} from './dto/create-solicitacao-compra.dto';
import { MaterialService } from './material.service';

class UpdateSolicitacaoStatusDto {
  @IsEnum(['APROVAR', 'RECUSAR'])
  acao: 'APROVAR' | 'RECUSAR';

  @IsOptional()
  @IsString()
  observacao?: string;

  @IsOptional()
  @IsBoolean()
  ignorar_check?: boolean;

  @IsOptional()
  @IsString()
  material_id?: string;

  @IsOptional()
  @IsNumber()
  valor_unitario?: number;
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

  @Get('preventiva/:preventivaId')
  findByPreventiva(@Param('preventivaId') preventivaId: string) {
    return this.materialService.findSolicitacoesCompraByPreventiva(preventivaId);
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
      dto.ignorar_check,
      dto.material_id,
      dto.valor_unitario,
    );
  }

  @Post(':id/items')
  addItem(@Param('id') id: string, @Body() dto: CreateItemSolicitacaoDto) {
    return this.materialService.addItemToSolicitacao(id, dto);
  }
}
