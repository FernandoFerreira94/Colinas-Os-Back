import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StatusOS, TipoOS } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrdemServicoDto } from './dto/create-ordem-servico.dto';
import { UpdateOrdemServicoDto } from './dto/update-ordem-servico.dto';
import { UpdateStatusOsDto } from './dto/update-status-os.dto';
import { gerarCodigoOS } from './helpers/gerar-codigo-os.helper';

@Injectable()
export class OrdemServicoService {
  constructor(private prisma: PrismaService) {}

  private readonly includeRelations = {
    criado_por: { select: { id: true, nameFull: true, funcao: true } },
    tecnico: { select: { id: true, nameFull: true, funcao: true } },
    atribuido_por: { select: { id: true, nameFull: true, funcao: true } },
    localizacao: true,
    equipamento: { include: { categoria: true } },
    equipamentos_os: {
      include: { equipamento: { include: { categoria: true } } },
    },
    empresa: true,
    apoios: {
      include: {
        user: { select: { id: true, nameFull: true, funcao: true } },
      },
    },
    materiais_gastos: true,
  };

  async findAll() {
    return this.prisma.ordemServico.findMany({
      include: this.includeRelations,
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: string) {
    const os = await this.prisma.ordemServico.findUnique({
      where: { id },
      include: this.includeRelations,
    });

    if (!os) {
      throw new NotFoundException('Ordem de Serviço não encontrada.');
    }

    return os;
  }

  async findByStatus(status: StatusOS) {
    return this.prisma.ordemServico.findMany({
      where: { status },
      include: this.includeRelations,
      orderBy: { created_at: 'desc' },
    });
  }

  async findByCategoria(categoria: string) {
    return this.prisma.ordemServico.findMany({
      where: { categoria },
      include: this.includeRelations,
      orderBy: { created_at: 'desc' },
    });
  }

  async findByTipo(tipo: TipoOS) {
    return this.prisma.ordemServico.findMany({
      where: { tipo },
      include: this.includeRelations,
      orderBy: { created_at: 'desc' },
    });
  }

  async create(dto: CreateOrdemServicoDto) {
    const { equipamentos_ids, ...osData } = dto;

    return this.prisma.$transaction(async (tx) => {
      const codigo = await gerarCodigoOS(tx as any, osData.tipo, osData.categoria);

      const os = await tx.ordemServico.create({
        data: {
          ...osData,
          codigo,
          fotos: osData.fotos ?? [],
          status: 'ABERTA',
          tecnico_id: osData.tecnico_id ?? null,
          equipamento_id:
            equipamentos_ids?.[0] ?? osData.equipamento_id ?? null,
        },
      });

      if (equipamentos_ids && equipamentos_ids.length > 0) {
        await tx.osEquipamento.createMany({
          data: equipamentos_ids.map((equipamento_id) => ({
            os_id: os.id,
            equipamento_id,
          })),
          skipDuplicates: true,
        });
      }

      return tx.ordemServico.findUnique({
        where: { id: os.id },
        include: this.includeRelations,
      });
    });
  }

  async update(id: string, dto: UpdateOrdemServicoDto) {
    await this.findOne(id);

    const { finalizada_at, ...data } = dto;

    return this.prisma.ordemServico.update({
      where: { id },
      data: {
        ...data,
        ...(finalizada_at ? { finalizada_at: new Date(finalizada_at) } : {}),
      },
      include: this.includeRelations,
    });
  }

  async updateStatus(id: string, dto: UpdateStatusOsDto) {
    await this.findOne(id);

    if (dto.status === StatusOS.EM_EXECUCAO && !dto.tecnico_id) {
      throw new BadRequestException(
        'tecnico_id é obrigatório para iniciar a execução.',
      );
    }

    const data: {
      status: StatusOS;
      tecnico_id?: string;
      finalizada_at?: Date;
      atribuido_por_id?: string;
    } = { status: dto.status };

    if (dto.status === StatusOS.EM_EXECUCAO) {
      data.tecnico_id = dto.tecnico_id;
    }

    if (dto.status === StatusOS.FINALIZADA) {
      data.finalizada_at = new Date();
    }

    if (dto.atribuido_por_id) {
      data.atribuido_por_id = dto.atribuido_por_id;
    }

    return this.prisma.ordemServico.update({
      where: { id },
      data,
      include: this.includeRelations,
    });
  }

  async addApoio(osId: string, userId: string) {
    const os = await this.findOne(osId);

    if (os.status !== StatusOS.EM_EXECUCAO) {
      throw new BadRequestException(
        'Só é possível adicionar apoio em OS com status EM_EXECUCAO.',
      );
    }

    return this.prisma.osApoio.create({
      data: { os_id: osId, user_id: userId },
      include: {
        user: { select: { id: true, nameFull: true, funcao: true } },
      },
    });
  }

  async addEquipamento(osId: string, equipamentoId: string) {
    await this.findOne(osId);

    return this.prisma.osEquipamento.create({
      data: { os_id: osId, equipamento_id: equipamentoId },
      include: { equipamento: true },
    });
  }

  async removeEquipamento(osId: string, equipamentoId: string) {
    const os = await this.findOne(osId);

    if (os.equipamento_id === equipamentoId) {
      throw new BadRequestException(
        'Não é possível remover o equipamento principal da OS.',
      );
    }

    const registro = await this.prisma.osEquipamento.findUnique({
      where: {
        os_id_equipamento_id: { os_id: osId, equipamento_id: equipamentoId },
      },
    });

    if (!registro) {
      throw new NotFoundException('Equipamento não encontrado nesta OS.');
    }

    return this.prisma.osEquipamento.delete({
      where: {
        os_id_equipamento_id: { os_id: osId, equipamento_id: equipamentoId },
      },
    });
  }

  async removeApoio(osId: string, userId: string) {
    await this.findOne(osId);

    const apoio = await this.prisma.osApoio.findUnique({
      where: { os_id_user_id: { os_id: osId, user_id: userId } },
    });

    if (!apoio) {
      throw new NotFoundException('Técnico de apoio não encontrado nesta OS.');
    }

    return this.prisma.osApoio.delete({
      where: { os_id_user_id: { os_id: osId, user_id: userId } },
    });
  }

  async solicitarMaterial(id: string, _userId: string) {
    const os = await this.findOne(id);

    if (os.status !== StatusOS.EM_EXECUCAO) {
      throw new BadRequestException(
        `Transição inválida: status atual é ${os.status}. Esperado: EM_EXECUCAO.`,
      );
    }

    return this.prisma.ordemServico.update({
      where: { id },
      data: { status: StatusOS.AGUARDANDO_MATERIAL },
      include: this.includeRelations,
    });
  }

  async enviarParaFiscalizacao(id: string, _userId: string) {
    const os = await this.findOne(id);

    const statusPermitidos: StatusOS[] = [
      StatusOS.EM_EXECUCAO,
      StatusOS.AGUARDANDO_MATERIAL,
    ];

    if (!statusPermitidos.includes(os.status)) {
      throw new BadRequestException(
        `Transição inválida: status atual é ${os.status}. Permitido: EM_EXECUCAO ou AGUARDANDO_MATERIAL.`,
      );
    }

    return this.prisma.ordemServico.update({
      where: { id },
      data: { status: StatusOS.AGUARDANDO_FISCALIZACAO },
      include: this.includeRelations,
    });
  }

  async finalizar(id: string, _userId: string) {
    const os = await this.findOne(id);

    const statusPermitidos: StatusOS[] = [
      StatusOS.EM_EXECUCAO,
      StatusOS.AGUARDANDO_MATERIAL,
      StatusOS.AGUARDANDO_FISCALIZACAO,
    ];

    if (!statusPermitidos.includes(os.status)) {
      throw new BadRequestException(
        `Transição inválida: status atual é ${os.status}. Permitido: EM_EXECUCAO, AGUARDANDO_MATERIAL ou AGUARDANDO_FISCALIZACAO.`,
      );
    }

    return this.prisma.ordemServico.update({
      where: { id },
      data: { status: StatusOS.FINALIZADA, finalizada_at: new Date() },
      include: this.includeRelations,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.ordemServico.delete({ where: { id } });
  }
}
