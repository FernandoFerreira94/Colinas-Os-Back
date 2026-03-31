import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMaterialGastoDto } from './dto/create-material-gasto.dto';

@Injectable()
export class MateriaisGastosService {
  constructor(private readonly prisma: PrismaService) {}

  async registrar(dto: CreateMaterialGastoDto, usuarioId: string) {
    if (!dto.os_id && !dto.preventiva_id) {
      throw new BadRequestException('Informe os_id ou preventiva_id');
    }

    // Valida o contexto (OS ou Preventiva)
    if (dto.os_id) {
      const os = await this.prisma.ordemServico.findUnique({
        where: { id: dto.os_id },
      });
      if (!os) throw new NotFoundException('Ordem de Serviço não encontrada');

      const statusPermitidos = ['EM_EXECUCAO', 'AGUARDANDO_MATERIAL', 'MATERIAL_COMPRADO'];
      if (!statusPermitidos.includes(os.status)) {
        throw new BadRequestException(
          'Só é possível registrar materiais em OS com status EM_EXECUCAO, AGUARDANDO_MATERIAL ou MATERIAL_COMPRADO',
        );
      }
    }

    if (dto.preventiva_id) {
      const preventiva = await this.prisma.preventiva.findUnique({
        where: { id: dto.preventiva_id },
      });
      if (!preventiva) throw new NotFoundException('Preventiva não encontrada');
    }

    // Valida estoque de cada item
    for (const item of dto.itens) {
      const material = await this.prisma.material.findUnique({
        where: { id: item.material_id },
      });
      if (!material) {
        throw new NotFoundException(`Material ${item.material_id} não encontrado`);
      }
      if (material.quantidade_estoque < item.quantidade) {
        throw new BadRequestException(
          `Estoque insuficiente para "${material.descricao}". ` +
            `Disponível: ${material.quantidade_estoque}, solicitado: ${item.quantidade}`,
        );
      }
    }

    const descricaoMovimentacao = dto.preventiva_id
      ? `Saída por Preventiva`
      : `Saída por OS`;

    return this.prisma.$transaction(async (tx) => {
      const gastos: Record<string, unknown>[] = [];

      for (const item of dto.itens) {
        const gasto = await tx.materialGasto.create({
          data: {
            os_id: dto.os_id ?? null,
            preventiva_id: dto.preventiva_id ?? null,
            material_id: item.material_id,
            quantidade: item.quantidade,
            registrado_por_id: usuarioId,
          },
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
        });

        await tx.material.update({
          where: { id: item.material_id },
          data: { quantidade_estoque: { decrement: item.quantidade } },
        });

        await tx.movimentacaoEstoque.create({
          data: {
            material_id: item.material_id,
            tipo: 'SAIDA',
            quantidade: item.quantidade,
            os_id: dto.os_id ?? null,
            usuario_id: usuarioId,
            descricao: descricaoMovimentacao,
          },
        });

        gastos.push(gasto);
      }

      return gastos;
    });
  }

  async remove(id: string) {
    const gasto = await this.prisma.materialGasto.findUnique({
      where: { id },
      include: { material: true },
    });

    if (!gasto) {
      throw new NotFoundException('Registro de material gasto não encontrado');
    }

    return this.prisma.$transaction(async (tx) => {
      if (gasto.material_id) {
        await tx.material.update({
          where: { id: gasto.material_id },
          data: { quantidade_estoque: { increment: gasto.quantidade } },
        });

        await tx.movimentacaoEstoque.create({
          data: {
            material_id: gasto.material_id,
            tipo: 'ENTRADA',
            quantidade: gasto.quantidade,
            os_id: gasto.os_id,
            usuario_id: gasto.registrado_por_id,
            descricao: `Estorno de material gasto — registro cancelado`,
          },
        });
      }

      await tx.materialGasto.delete({ where: { id } });

      return { success: true };
    });
  }

  async findByOs(osId: string) {
    const os = await this.prisma.ordemServico.findUnique({ where: { id: osId } });
    if (!os) throw new NotFoundException('Ordem de Serviço não encontrada');

    return this.prisma.materialGasto.findMany({
      where: { os_id: osId },
      orderBy: { created_at: 'desc' },
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
    });
  }

  async findByPreventiva(preventivaId: string) {
    const preventiva = await this.prisma.preventiva.findUnique({
      where: { id: preventivaId },
    });
    if (!preventiva) throw new NotFoundException('Preventiva não encontrada');

    return this.prisma.materialGasto.findMany({
      where: { preventiva_id: preventivaId },
      orderBy: { created_at: 'desc' },
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
    });
  }

  async findParaBaixa() {
    return this.prisma.materialGasto.findMany({
      where: { status_baixa: false },
      orderBy: { created_at: 'desc' },
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
        os: {
          select: { id: true, codigo: true, titulo: true },
        },
        preventiva: {
          select: { id: true, checklist:true, equipamento: true },
        },
      },
    });
  }

  async darBaixa(id: string) {
    const gasto = await this.prisma.materialGasto.findUnique({ where: { id } });
    if (!gasto) throw new NotFoundException('Registro de material gasto não encontrado');
    if (gasto.status_baixa) throw new BadRequestException('Este material já recebeu baixa');

    return this.prisma.materialGasto.update({
      where: { id },
      data: { status_baixa: true },
    });
  }
}
