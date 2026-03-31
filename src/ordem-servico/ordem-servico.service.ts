import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FuncaoUser, StatusOS, TipoOS } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrdemServicoDto } from './dto/create-ordem-servico.dto';
import { UpdateOrdemServicoDto } from './dto/update-ordem-servico.dto';
import { UpdateStatusOsDto } from './dto/update-status-os.dto';
import { gerarCodigoOS } from './helpers/gerar-codigo-os.helper';

const FUNCOES_LIDER: FuncaoUser[] = [
  FuncaoUser.LIDER,
  FuncaoUser.SUPERVISOR,
  FuncaoUser.COORDENADOR,
  FuncaoUser.GERENTE_OPERACIONAL,
];

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
    materiais_gastos: {
      include: {
        material: {
          select: {
            id: true,
            codigo: true,
            descricao: true,
            unidade: true,
            marca: true,
            price: true,
          },
        },
        registrado_por: {
          select: { id: true, nameFull: true, funcao: true },
        },
      },
      orderBy: { created_at: 'asc' as const },
    },
    historico: {
      include: {
        criado_por: { select: { id: true, nameFull: true, funcao: true } },
      },
      orderBy: { criado_em: 'asc' as const },
    },
    solicitacoes: {
      include: {
        itens: {
          include: {
            material: {
              select: {
                id: true,
                codigo: true,
                descricao: true,
                unidade: true,
                price: true,
              },
            },
          },
        },
        criado_por: { select: { id: true, nameFull: true, funcao: true } },
      },
      orderBy: { criado_em: 'asc' as const },
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
    const os = await this.prisma.$transaction(async (tx) => {
      const codigo = await gerarCodigoOS(tx, osData.tipo, osData.categoria);

      const createdOs = await tx.ordemServico.create({
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

      if (equipamentos_ids?.length) {
        await tx.osEquipamento.createMany({
          data: equipamentos_ids.map((equipamento_id) => ({
            os_id: createdOs.id,
            equipamento_id,
          })),
          skipDuplicates: true,
        });
      }

      await tx.osHistorico.create({
        data: {
          os_id: createdOs.id,
          status_gerado: StatusOS.ABERTA,
          descricao:
            osData.descricao ??
            'Ordem de Serviço criada e aguardando início da execução.',
          criado_por_id: osData.criado_por_id,
        },
      });

      return createdOs.id; // 👈 retorna só o ID
    });

    // ✅ FORA da transaction (zero risco de timeout)
    return this.prisma.ordemServico.findUnique({
      where: { id: os },
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

  async updateStatus(id: string, dto: UpdateStatusOsDto, userId: string) {
    const os = await this.findOne(id);

    // só exige tecnico_id se a OS ainda não tem um (novo início)
    if (
      dto.status === StatusOS.EM_EXECUCAO &&
      !dto.tecnico_id &&
      !os.tecnico_id
    ) {
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

    if (dto.status === StatusOS.EM_EXECUCAO && dto.tecnico_id) {
      data.tecnico_id = dto.tecnico_id;
    }

    if (dto.status === StatusOS.FINALIZADA) {
      data.finalizada_at = new Date();
    }

    if (dto.atribuido_por_id) {
      data.atribuido_por_id = dto.atribuido_por_id;
    }

    let descricaoFinal = dto.relatorio ?? `Status alterado para ${dto.status}`;

    // Busca materiais solicitados para detalhar no histórico
    if (
      dto.status === StatusOS.MATERIAL_COMPRADO ||
      dto.status === StatusOS.MATERIAL_RECUSADO
    ) {
      const solicitacoes = await this.prisma.solicitacaoCompra.findMany({
        where: { os_id: id, status: 'PENDENTE' },
        include: { itens: true },
      });

      if (solicitacoes.length > 0) {
        const itensLista = solicitacoes.flatMap((s) => s.itens);
        const nomesMateriais = itensLista
          .map(
            (i) =>
              `${i.quantidade}x ${i.descricao}${i.cor ? ` (${i.cor})` : ''}`,
          )
          .join(', ');

        const prefixo =
          dto.status === StatusOS.MATERIAL_COMPRADO
            ? 'Materiais comprados'
            : 'Materiais recusados';

        descricaoFinal = `${prefixo}: ${nomesMateriais}. ${
          dto.relatorio ?? ''
        }`.trim();
      }
    }

    // Mantém apenas escritas leves dentro da transação para evitar timeout (P2028)
    await this.prisma.$transaction([
      this.prisma.ordemServico.update({ where: { id }, data }),
      this.prisma.osHistorico.create({
        data: {
          os_id: id,
          status_gerado: dto.status,
          descricao: descricaoFinal,
          criado_por_id: userId,
          recusado: dto.status === StatusOS.MATERIAL_RECUSADO,
        },
      }),
      ...(dto.status === StatusOS.MATERIAL_RECUSADO
        ? [
            this.prisma.solicitacaoCompra.updateMany({
              where: { os_id: id, status: 'PENDENTE' },
              data: { status: 'RECUSADA' },
            }),
          ]
        : []),
      ...(dto.status === StatusOS.MATERIAL_COMPRADO
        ? [
            this.prisma.solicitacaoCompra.updateMany({
              where: { os_id: id, status: 'PENDENTE' },
              data: { status: 'APROVADA' },
            }),
          ]
        : []),
    ]);

    return this.findOne(id);
  }

  // ─── Lógica de Produtividade ──────────────────────────────────────────────

  private async contabilizarProdutividade(
    osId: string,
    finalizadorId: string,
    tx: any,
  ) {
    const os = await tx.ordemServico.findUnique({
      where: { id: osId },
      select: { produtividade_contabilizada: true, tecnico_id: true },
    });

    if (!os || os.produtividade_contabilizada) return;

    // 1. Incrementa OS Finalizada para quem está concluindo (finalizador ou tecnico atual)
    const idParaFinalizar = finalizadorId || os.tecnico_id;

    if (idParaFinalizar) {
      await tx.user.update({
        where: { id: idParaFinalizar },
        data: { os_finalizadas: { increment: 1 } },
      });
    }

    // 2. Busca e incrementa OS Apoio para todos os envolvidos
    const apoios = await tx.osApoio.findMany({
      where: { os_id: osId },
      select: { user_id: true },
    });

    for (const apoio of apoios) {
      await tx.user.update({
        where: { id: apoio.user_id },
        data: { os_apoio: { increment: 1 } },
      });
    }

    // 3. Marca como contabilizada
    await tx.ordemServico.update({
      where: { id: osId },
      data: { produtividade_contabilizada: true },
    });
  }

  // ─── Adicionar apoio (helper interno) ─────────────────────────────────────

  private async adicionarApoios(osId: string, apoioIds: string[]) {
    for (const apoioId of apoioIds) {
      await this.prisma.osApoio.upsert({
        where: { os_id_user_id: { os_id: osId, user_id: apoioId } },
        create: { os_id: osId, user_id: apoioId },
        update: {},
      });
    }
  }

  async addApoio(osId: string, userId: string) {
    const os = await this.findOne(osId);

    const statusPermitidos: StatusOS[] = [
      StatusOS.EM_EXECUCAO,
      StatusOS.PAUSADA,
      StatusOS.AGUARDANDO_MATERIAL,
      StatusOS.AGUARDANDO_FISCALIZACAO,
    ];

    if (!statusPermitidos.includes(os.status)) {
      throw new BadRequestException(
        'Só é possível adicionar apoio em OS ativa (em execução, pausada, aguardando material ou fiscalização).',
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

  async solicitarMaterial(
    id: string,
    userId: string,
    relatorio: string,
    apoioIds?: string[],
  ) {
    const os = await this.findOne(id);

    if (os.status !== StatusOS.EM_EXECUCAO) {
      throw new BadRequestException(
        `Transição inválida: status atual é ${os.status}. Esperado: EM_EXECUCAO.`,
      );
    }

    if (apoioIds && apoioIds.length > 0) {
      await this.adicionarApoios(id, apoioIds);
    }

    const updated = await this.prisma.ordemServico.update({
      where: { id },
      data: { status: StatusOS.AGUARDANDO_MATERIAL },
      include: this.includeRelations,
    });

    await this.prisma.osHistorico.create({
      data: {
        os_id: id,
        status_gerado: StatusOS.AGUARDANDO_MATERIAL,
        descricao: relatorio,
        criado_por_id: userId,
      },
    });

    return updated;
  }

  async enviarParaFiscalizacao(
    id: string,
    userId: string,
    relatorio: string,
    apoioIds?: string[],
  ) {
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

    return this.prisma.$transaction(async (tx) => {
      if (apoioIds && apoioIds.length > 0) {
        for (const apoioId of apoioIds) {
          await tx.osApoio.upsert({
            where: { os_id_user_id: { os_id: id, user_id: apoioId } },
            create: { os_id: id, user_id: apoioId },
            update: {},
          });
        }
      }

      // Contabiliza produtividade
      await this.contabilizarProdutividade(id, userId, tx);

      const updated = await tx.ordemServico.update({
        where: { id },
        data: { status: StatusOS.AGUARDANDO_FISCALIZACAO },
        include: this.includeRelations,
      });

      await tx.osHistorico.create({
        data: {
          os_id: id,
          status_gerado: StatusOS.AGUARDANDO_FISCALIZACAO,
          descricao: relatorio,
          criado_por_id: userId,
        },
      });

      return updated;
    });
  }

  async pausar(
    id: string,
    userId: string,
    relatorio: string,
    apoioIds?: string[],
    fotos?: string[],
  ) {
    const os = await this.findOne(id);

    if (os.status !== StatusOS.EM_EXECUCAO) {
      throw new BadRequestException(
        'Só é possível pausar OS com status EM_EXECUCAO.',
      );
    }

    if (apoioIds && apoioIds.length > 0) {
      await this.adicionarApoios(id, apoioIds);
    }

    const updated = await this.prisma.ordemServico.update({
      where: { id },
      data: {
        status: StatusOS.PAUSADA,
        ...(fotos && fotos.length > 0 ? { fotos: { push: fotos } } : {}),
      },
      include: this.includeRelations,
    });

    await this.prisma.osHistorico.create({
      data: {
        os_id: id,
        status_gerado: StatusOS.PAUSADA,
        descricao: relatorio,
        criado_por_id: userId,
      },
    });

    return updated;
  }

  async retomarExecucao(
    id: string,
    userId: string,
    tecnicoId: string,
    atribuidoPorId?: string,
  ) {
    const os = await this.findOne(id);

    const statusPermitidos: StatusOS[] = [StatusOS.PAUSADA, StatusOS.RECUSADO];

    if (!statusPermitidos.includes(os.status)) {
      throw new BadRequestException(
        `Só é possível retomar OS com status PAUSADA ou RECUSADO.`,
      );
    }

    // Se o novo técnico é diferente do atual, o anterior vira apoio
    if (os.tecnico_id && os.tecnico_id !== tecnicoId) {
      await this.prisma.osApoio.upsert({
        where: { os_id_user_id: { os_id: id, user_id: os.tecnico_id } },
        create: { os_id: id, user_id: os.tecnico_id },
        update: {},
      });
    }

    const updated = await this.prisma.ordemServico.update({
      where: { id },
      data: {
        status: StatusOS.EM_EXECUCAO,
        tecnico_id: tecnicoId,
        ...(atribuidoPorId ? { atribuido_por_id: atribuidoPorId } : {}),
      },
      include: this.includeRelations,
    });

    await this.prisma.osHistorico.create({
      data: {
        os_id: id,
        status_gerado: StatusOS.EM_EXECUCAO,
        descricao: 'Execução retomada.',
        criado_por_id: userId,
      },
    });

    return updated;
  }

  async finalizar(
    id: string,
    userId: string,
    relatorio: string,
    apoioIds?: string[],
    fotos?: string[],
  ) {
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

    return this.prisma.$transaction(async (tx) => {
      if (apoioIds && apoioIds.length > 0) {
        for (const apoioId of apoioIds) {
          await tx.osApoio.upsert({
            where: { os_id_user_id: { os_id: id, user_id: apoioId } },
            create: { os_id: id, user_id: apoioId },
            update: {},
          });
        }
      }

      // Se NÃO vem de fiscalização, contabiliza agora (pois é finalização direta)
      // Se vem de fiscalização, o técnico já foi contabilizado no 'enviarParaFiscalizacao'
      if (os.status !== StatusOS.AGUARDANDO_FISCALIZACAO) {
        await this.contabilizarProdutividade(id, userId, tx);
      }

      const updated = await tx.ordemServico.update({
        where: { id },
        data: {
          status: StatusOS.FINALIZADA,
          finalizada_at: new Date(),
          ...(fotos && fotos.length > 0 ? { fotos: { push: fotos } } : {}),
        },
        include: this.includeRelations,
      });

      await tx.osHistorico.create({
        data: {
          os_id: id,
          status_gerado: StatusOS.FINALIZADA,
          descricao: relatorio,
          criado_por_id: userId,
        },
      });

      return updated;
    });
  }

  async recusarFiscalizacao(id: string, userId: string, motivo: string) {
    const os = await this.findOne(id);

    if (os.status !== StatusOS.AGUARDANDO_FISCALIZACAO) {
      throw new BadRequestException(
        'Só é possível recusar fiscalização em OS com status AGUARDANDO_FISCALIZACAO.',
      );
    }

    const usuario = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { funcao: true, is_admin: true },
    });

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    const isAutorizado =
      usuario.is_admin || FUNCOES_LIDER.includes(usuario.funcao);

    if (!isAutorizado) {
      throw new ForbiddenException(
        'Apenas líderes, supervisores, coordenadores ou administradores podem recusar a fiscalização.',
      );
    }

    // FIX: status vai para RECUSADO (não EM_EXECUCAO) — permite reiniciar via IniciarOSDialog
    const updated = await this.prisma.ordemServico.update({
      where: { id },
      data: { status: StatusOS.RECUSADO },
      include: this.includeRelations,
    });

    await this.prisma.osHistorico.create({
      data: {
        os_id: id,
        status_gerado: StatusOS.RECUSADO,
        descricao: motivo,
        recusado: true,
        criado_por_id: userId,
      },
    });

    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.ordemServico.delete({ where: { id } });
  }
}
