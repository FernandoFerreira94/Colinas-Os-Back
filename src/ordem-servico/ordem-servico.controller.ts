import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ContextoFoto, StatusOS, TipoOS } from '@prisma/client';
import { IsEnum, IsString, IsUrl } from 'class-validator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissaoGuard } from 'src/auth/guards/permissao.guard';
import { UploadService } from 'src/upload/upload.service';
import { CreateOrdemServicoDto } from './dto/create-ordem-servico.dto';
import { RelatorioEtapaDto } from './dto/relatorio-etapa.dto';
import { UpdateOrdemServicoDto } from './dto/update-ordem-servico.dto';
import { UpdateStatusOsDto } from './dto/update-status-os.dto';
import { OrdemServicoService } from './ordem-servico.service';

class CreateOsFotoDto {
  @IsString()
  @IsUrl()
  url: string;

  @IsEnum(ContextoFoto)
  contexto: ContextoFoto;
}

@Controller('ordem-servico')
export class OrdemServicoController {
  constructor(
    private readonly ordemServicoService: OrdemServicoService,
    private readonly uploadService: UploadService,
  ) {}

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

  @UseGuards(JwtAuthGuard)
  @Delete('fotos/:fotoId')
  removeFoto(@Param('fotoId') fotoId: string) {
    return this.ordemServicoService.removeFoto(fotoId, this.uploadService);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/fotos')
  addFoto(@Param('id') id: string, @Body() dto: CreateOsFotoDto) {
    return this.ordemServicoService.addFoto(id, dto);
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

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusOsDto,
    @CurrentUser() user: { sub: string },
  ) {
    return this.ordemServicoService.updateStatus(id, dto, user.sub);
  }

  // FIX: removido PermissaoGuard — técnicos comuns precisam solicitar material
  @UseGuards(JwtAuthGuard)
  @Patch(':id/solicitar-material')
  solicitarMaterial(
    @Param('id') id: string,
    @Body() body: RelatorioEtapaDto,
    @CurrentUser() user: { sub: string },
  ) {
    return this.ordemServicoService.solicitarMaterial(
      id,
      user.sub,
      body.relatorio,
      body.apoio_ids,
    );
  }

  // FIX: removido PermissaoGuard — técnicos comuns precisam enviar para fiscalização
  @UseGuards(JwtAuthGuard)
  @Patch(':id/fiscalizacao')
  enviarParaFiscalizacao(
    @Param('id') id: string,
    @Body() body: RelatorioEtapaDto,
    @CurrentUser() user: { sub: string },
  ) {
    return this.ordemServicoService.enviarParaFiscalizacao(
      id,
      user.sub,
      body.relatorio,
      body.apoio_ids,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/pausar')
  pausar(
    @Param('id') id: string,
    @Body() body: RelatorioEtapaDto,
    @CurrentUser() user: { sub: string },
  ) {
    return this.ordemServicoService.pausar(
      id,
      user.sub,
      body.relatorio,
      body.apoio_ids,
      body.fotos,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/retomar-execucao')
  retomarExecucao(
    @Param('id') id: string,
    @Body() body: { tecnico_id: string; atribuido_por_id?: string },
    @CurrentUser() user: { sub: string },
  ) {
    return this.ordemServicoService.retomarExecucao(
      id,
      user.sub,
      body.tecnico_id,
      body.atribuido_por_id,
    );
  }

  @UseGuards(JwtAuthGuard, PermissaoGuard)
  @Patch(':id/finalizar')
  finalizar(
    @Param('id') id: string,
    @Body() body: RelatorioEtapaDto,
    @CurrentUser() user: { sub: string },
  ) {
    return this.ordemServicoService.finalizar(id, user.sub, body.relatorio, body.apoio_ids, body.fotos);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/recusar-fiscalizacao')
  recusarFiscalizacao(
    @Param('id') id: string,
    @Body() body: RelatorioEtapaDto,
    @CurrentUser() user: { sub: string },
  ) {
    return this.ordemServicoService.recusarFiscalizacao(
      id,
      user.sub,
      body.relatorio,
    );
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

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordemServicoService.remove(id);
  }
}
