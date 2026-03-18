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

@Injectable()
export class OrdemServicoService {
  constructor(private prisma: PrismaService) {}

  private readonly includeRelations = {
    criado_por: {
      select: { id: true, nameFull: true, matricula: true, funcao: true },
    },
    tecnico: {
      select: { id: true, nameFull: true, matricula: true, funcao: true },
    },
    equipamento: true,
    localizacao: true,
    empresa: true,
    apoios: {
      include: {
        user: {
          select: { id: true, nameFull: true, matricula: true, funcao: true },
        },
      },
    },
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

  async findByTipo(tipo: TipoOS) {
    return this.prisma.ordemServico.findMany({
      where: { tipo },
      include: this.includeRelations,
      orderBy: { created_at: 'desc' },
    });
  }

  async create(dto: CreateOrdemServicoDto) {
    return this.prisma.ordemServico.create({
      data: {
        ...dto,
        fotos: dto.fotos ?? [],
        status: StatusOS.ABERTA,
        tecnico_id: null,
      },
      include: this.includeRelations,
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
    } = { status: dto.status };

    if (dto.status === StatusOS.EM_EXECUCAO) {
      data.tecnico_id = dto.tecnico_id;
    }

    if (dto.status === StatusOS.FINALIZADA) {
      data.finalizada_at = new Date();
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
        user: {
          select: { id: true, nameFull: true, matricula: true, funcao: true },
        },
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

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.ordemServico.delete({ where: { id } });
  }
}
