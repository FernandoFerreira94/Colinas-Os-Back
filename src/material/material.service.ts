// material.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { StatusOS } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMaterialDto } from './dto/createMaterial.dto';
import { UpdateMaterialDto } from './dto/updateMaterial.dto';
import { FiltrarMaterialDto } from './dto/filtrar-material.dto';
import {
  CreateItemSolicitacaoDto,
  CreateSolicitacaoCompraDto,
} from './dto/create-solicitacao-compra.dto';

@Injectable()
export class MaterialService {
  constructor(private readonly prisma: PrismaService) {}

  async createMaterial(dto: CreateMaterialDto) {
    await this.assertCodigoDisponivel(dto.codigo);

    return await this.prisma.material.create({
      data: {
        codigo: dto.codigo,
        descricao: dto.descricao,
        cor: dto.cor,
        quantidade_minima: dto.quantidade_minima,
        quantidade_estoque: dto.quantidade_estoque,
        departamento: dto.departamento,
        foto_url: dto.foto_url,
        marca: dto.marca,
        price: dto.price,
        unidade: dto.unidade,
        subcategoriaId: dto.subcategoriaId,
      },
      include: {
        subcategoria: true,
      },
    });
  }

  async findAll(filtros: FiltrarMaterialDto = {}) {
    const page = filtros.page ?? 1;
    const limit = filtros.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = {
      ...(filtros.departamento && { departamento: filtros.departamento }),
      ...(filtros.subcategoria_id && {
        subcategoriaId: filtros.subcategoria_id,
      }),
      ...(filtros.nome && {
        descricao: { contains: filtros.nome, mode: 'insensitive' as const },
      }),
      ...(filtros.categoria_id && {
        subcategoria: { categoria_id: filtros.categoria_id },
      }),
    };

    const [materiais, total] = await this.prisma.$transaction([
      this.prisma.material.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          codigo: true,
          descricao: true,
          cor: true,
          marca: true,
          price: true,
          unidade: true,
          quantidade_estoque: true,
          quantidade_minima: true,
          notificacao_ativa: true,
          departamento: true,
          foto_url: true,
          subcategoria: {
            select: {
              id: true,
              subCategoria: true,
              categoria: {
                select: {
                  id: true,
                  categoria: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.material.count({ where }),
    ]);

    return {
      data: materiais,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const material = await this.prisma.material.findUnique({
      where: { id },
      include: {
        subcategoria: true,
      },
    });

    if (!material) {
      throw new NotFoundException('Material não encontrado');
    }

    return material;
  }

  async update(id: string, dto: UpdateMaterialDto) {
    await this.findById(id);

    if (dto.codigo) {
      await this.assertCodigoDisponivel(dto.codigo, id);
    }

    return this.prisma.material.update({
      where: { id },
      data: dto,
      include: {
        subcategoria: true,
      },
    });
  }

  async updateFoto(id: string, foto_url: string) {
    try {
      await this.findById(id);

      return await this.prisma.material.update({
        where: { id },
        data: { foto_url },
        include: {
          subcategoria: true,
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Erro ao atualizar foto do material',
      );
    }
  }

  async remove(id: string) {
    await this.findById(id);

    return this.prisma.material.delete({
      where: { id },
    });
  }

  // ─── Solicitações de compra ────────────────────────────────────────────────

  async createSolicitacaoCompra(
    dto: CreateSolicitacaoCompraDto,
    criadoPorId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const solicitacao = await tx.solicitacaoCompra.create({
        data: {
          os_id: dto.os_id,
          preventiva_id: dto.preventiva_id,
          observacao: dto.observacao,
          criado_por_id: criadoPorId,
          itens: {
            create: dto.itens.map((item) => ({
              tipo: item.tipo,
              material_id: item.material_id,
              nome: item.nome,
              descricao: item.descricao,
              unidade: item.unidade,
              cor: item.cor,
              imagem_url: item.imagem_url,
              quantidade: item.quantidade,
            })),
          },
        },
        include: {
          itens: {
            include: {
              material: {
                select: {
                  id: true,
                  codigo: true,
                  descricao: true,
                  unidade: true,
                  marca: true,
                },
              },
            },
          },
        },
      });

      // Se há os_id, verifica se precisa mudar status da OS para AGUARDANDO_MATERIAL
      if (dto.os_id) {
        const os = await tx.ordemServico.findUnique({
          where: { id: dto.os_id },
        });
        const statusPermitidos: StatusOS[] = [
          StatusOS.EM_EXECUCAO,
          StatusOS.PAUSADA,
          StatusOS.MATERIAL_COMPRADO,
          StatusOS.MATERIAL_RECUSADO,
        ];

        if (os && statusPermitidos.includes(os.status)) {
          await tx.ordemServico.update({
            where: { id: dto.os_id },
            data: { status: StatusOS.AGUARDANDO_MATERIAL },
          });
          await tx.osHistorico.create({
            data: {
              os_id: dto.os_id,
              status_gerado: StatusOS.AGUARDANDO_MATERIAL,
              descricao:
                dto.observacao ??
                'Solicitacao de material enviada agurdando compra',
              criado_por_id: criadoPorId,
            },
          });
        }
      }

      return solicitacao;
    });
  }

  async findSolicitacoesPendentes() {
    return this.prisma.solicitacaoCompra.findMany({
      where: { status: 'PENDENTE' },
      orderBy: { criado_em: 'desc' },
      include: {
        itens: {
          include: {
            material: {
              select: {
                id: true,
                codigo: true,
                descricao: true,
                unidade: true,
                marca: true,
                subcategoria: {
                  select: {
                    subCategoria: true,
                    categoria: { select: { categoria: true } },
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async updateSolicitacaoStatus(
    id: string,
    acao: 'APROVAR' | 'RECUSAR',
    usuarioId: string,
    observacao?: string,
    ignorarCheck?: boolean,
    material_id?: string,
    valor_unitario?: number,
  ) {
    const solicitacao = await this.prisma.solicitacaoCompra.findUnique({
      where: { id },
      include: {
        itens: {
          include: {
            material: true,
          },
        },
      },
    });

    if (!solicitacao) {
      throw new NotFoundException('Solicitação não encontrada');
    }

    if (solicitacao.status !== 'PENDENTE') {
      throw new BadRequestException('Solicitação já foi processada');
    }

    // ─── Verificação de Material (Apenas se for Aprovação) ───
    if (acao === 'APROVAR' && !ignorarCheck) {
      const itensNaoCadastrados = solicitacao.itens.filter(
        (i) => i.tipo === 'NAO_CADASTRADO',
      );

      for (const item of itensNaoCadastrados) {
        if (!item.nome) continue;

        // Tenta encontrar material pelo nome exato (case-insensitive)
        const materialExistente = await this.prisma.material.findFirst({
          where: {
            descricao: {
              equals: item.nome,
              mode: 'insensitive',
            },
          },
        });

        if (!materialExistente) {
          // Retorna erro informando que o material não foi encontrado para o frontend decidir
          return {
            needs_registration: true,
            item: {
              id: item.id,
              nome: item.nome,
              descricao: item.descricao,
              unidade: item.unidade,
              cor: item.cor,
              quantidade: item.quantidade,
            },
          };
        }
      }
    }

    const novoStatus = acao === 'APROVAR' ? 'APROVADA' : 'RECUSADA';
    const novoStatusOS =
      acao === 'APROVAR' ? 'MATERIAL_COMPRADO' : 'MATERIAL_RECUSADO';

    await this.prisma.$transaction(async (tx) => {
      await tx.solicitacaoCompra.update({
        where: { id },
        data: { status: novoStatus },
      });

      // Se um material_id foi fornecido (recém criado), vincula ao item
      if (acao === 'APROVAR' && material_id) {
        const itemNaoCadastrado = solicitacao.itens.find(
          (i) => i.tipo === 'NAO_CADASTRADO',
        );
        if (itemNaoCadastrado) {
          await tx.solicitacaoCompraItem.update({
            where: { id: itemNaoCadastrado.id },
            data: { material_id, tipo: 'CADASTRADO' },
          });
        }
      }

      if (solicitacao.os_id) {
        await tx.ordemServico.update({
          where: { id: solicitacao.os_id },
          data: { status: novoStatusOS },
        });

        await tx.osHistorico.create({
          data: {
            os_id: solicitacao.os_id,
            status_gerado: novoStatusOS,
            descricao:
              observacao ??
              (acao === 'APROVAR'
                ? 'Material comprado — solicitação aprovada pelo almoxarife'
                : 'Solicitação de material recusada pelo almoxarife'),
            recusado: acao === 'RECUSAR',
            criado_por_id: usuarioId,
          },
        });

        // ─── Lançamento Automático de Material Gasto ───
        if (acao === 'APROVAR') {
          for (const item of solicitacao.itens) {
            // Se foi fornecido um material_id agora (registro novo), usamos ele
            // Caso contrário, usamos o material_id que já estava no item (se houver)
            const finalMaterialId =
              item.tipo === 'NAO_CADASTRADO' && material_id
                ? material_id
                : (item.material_id ?? undefined);

            await tx.materialGasto.create({
              data: {
                os_id: solicitacao.os_id,
                material_id: finalMaterialId,
                nome: item.nome,
                descricao: item.descricao,
                unidade: item.unidade,
                cor: item.cor,
                quantidade: item.quantidade,
                valor_unitario: valor_unitario,
                registrado_por_id: usuarioId,
                status_baixa: true,
              },
            });
          }
        }
      }
    });

    return this.prisma.solicitacaoCompra.findUnique({
      where: { id },
      include: {
        itens: {
          include: {
            material: {
              select: {
                id: true,
                codigo: true,
                descricao: true,
                unidade: true,
                marca: true,
              },
            },
          },
        },
      },
    });
  }

  async findSolicitacoesCompraByOs(osId: string) {
    return this.prisma.solicitacaoCompra.findMany({
      where: { os_id: osId },
      orderBy: { criado_em: 'desc' },
      include: {
        itens: {
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
          },
        },
        criado_por: {
          select: { id: true, nameFull: true, funcao: true },
        },
      },
    });
  }

  async findSolicitacoesCompraByPreventiva(preventivaId: string) {
    return this.prisma.solicitacaoCompra.findMany({
      where: { preventiva_id: preventivaId },
      orderBy: { criado_em: 'desc' },
      include: {
        itens: {
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
          },
        },
        criado_por: {
          select: { id: true, nameFull: true, funcao: true },
        },
      },
    });
  }

  async addItemToSolicitacao(
    solicitacaoId: string,
    item: CreateItemSolicitacaoDto,
  ) {
    const solicitacao = await this.prisma.solicitacaoCompra.findUnique({
      where: { id: solicitacaoId },
    });
    if (!solicitacao) {
      throw new NotFoundException('Solicitação não encontrada');
    }
    if (solicitacao.status !== 'PENDENTE') {
      throw new BadRequestException(
        'Não é possível adicionar itens a uma solicitação já processada',
      );
    }

    return this.prisma.solicitacaoCompraItem.create({
      data: {
        solicitacao_id: solicitacaoId,
        tipo: item.tipo,
        material_id: item.material_id,
        nome: item.nome,
        descricao: item.descricao,
        unidade: item.unidade,
        imagem_url: item.imagem_url,
        quantidade: item.quantidade,
      },
      include: {
        material: {
          select: {
            id: true,
            codigo: true,
            descricao: true,
            unidade: true,
            marca: true,
          },
        },
      },
    });
  }

  async removeItemFromSolicitacao(itemId: string) {
    const item = await this.prisma.solicitacaoCompraItem.findUnique({
      where: { id: itemId },
      include: { solicitacao: true },
    });
    if (!item) {
      throw new NotFoundException('Item de solicitação não encontrado');
    }
    if (item.solicitacao.status !== 'PENDENTE') {
      throw new BadRequestException(
        'Não é possível remover itens de uma solicitação já processada',
      );
    }

    await this.prisma.solicitacaoCompraItem.delete({ where: { id: itemId } });
    return { success: true };
  }

  async findMateriaisEstoqueBaixo(materialIds?: string[]) {
    return this.prisma.material
      .findMany({
        where: {
          notificacao_ativa: true,
          quantidade_minima: { not: null },
          ...(materialIds && { id: { in: materialIds } }),
        },
        select: {
          id: true,
          codigo: true,
          descricao: true,
          unidade: true,
          quantidade_estoque: true,
          quantidade_minima: true,
          notificacao_ativa: true,
          departamento: true,
          subcategoria: {
            select: {
              subCategoria: true,
              categoria: { select: { categoria: true } },
            },
          },
        },
        orderBy: { quantidade_estoque: 'asc' },
      })
      .then((materiais) =>
        materiais.filter(
          (m) =>
            m.quantidade_minima !== null &&
            m.quantidade_estoque <= m.quantidade_minima,
        ),
      );
  }

  // --- helpers privados ---

  private async assertCodigoDisponivel(codigo: string, ignorarId?: string) {
    const existing = await this.prisma.material.findUnique({
      where: { codigo },
    });

    if (existing && existing.id !== ignorarId) {
      throw new ConflictException('Código já está em uso');
    }
  }
}
