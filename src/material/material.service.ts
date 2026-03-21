// material.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMaterialDto } from './dto/createMaterial.dto';
import { UpdateMaterialDto } from './dto/updateMaterial.dto';
import { FiltrarMaterialDto } from './dto/filtrar-material.dto';
import { CreateSolicitacaoCompraDto } from './dto/create-solicitacao-compra.dto';

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
    const materiais = await this.prisma.material.findMany({
      where: {
        ...(filtros.departamento && { departamento: filtros.departamento as any }),
        ...(filtros.subcategoria_id && { subcategoriaId: filtros.subcategoria_id }),
        ...(filtros.nome && {
          descricao: { contains: filtros.nome, mode: 'insensitive' },
        }),
        ...(filtros.categoria_id && {
          subcategoria: { categoria_id: filtros.categoria_id },
        }),
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        codigo: true,
        descricao: true,
        unidade: true,
        quantidade_estoque: true,
        departamento: true,
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
    });

    return materiais.map((m) => ({
      id: m.id,
      codigo: m.codigo,
      descricao: m.descricao,
      unidade: m.unidade,
      quantidade_estoque: m.quantidade_estoque,
      departamento: m.departamento,
      categoria: {
        id: m.subcategoria.categoria.id,
        nome: m.subcategoria.categoria.categoria,
      },
      subcategoria: {
        id: m.subcategoria.id,
        nome: m.subcategoria.subCategoria,
      },
      ...(m.quantidade_estoque === 0 && { sem_estoque: true }),
    }));
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
    return this.prisma.solicitacaoCompra.create({
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

  async findMateriaisParaBaixa() {
    // TODO: Implementar quando o model MaterialGasto for criado no schema.
    // Deve retornar registros de MaterialGasto onde status_baixa = false,
    // incluindo os_id, material (codigo, descricao, unidade) e quantidade_usada.
    return [];
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
