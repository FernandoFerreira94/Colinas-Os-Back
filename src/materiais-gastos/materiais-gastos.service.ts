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
    // 1. Valida OS e status
    const os = await this.prisma.ordemServico.findUnique({
      where: { id: dto.os_id },
    });

    if (!os) {
      throw new NotFoundException('Ordem de Serviço não encontrada');
    }

    if (os.status !== 'EM_EXECUCAO') {
      throw new BadRequestException(
        'Só é possível registrar materiais em OS com status EM_EXECUCAO',
      );
    }

    // 2. Valida estoque de cada item
    for (const item of dto.itens) {
      const material = await this.prisma.material.findUnique({
        where: { id: item.material_id },
      });

      if (!material) {
        throw new NotFoundException(
          `Material ${item.material_id} não encontrado`,
        );
      }

      if (material.quantidade_estoque < item.quantidade) {
        throw new BadRequestException(
          `Estoque insuficiente para "${material.descricao}". ` +
            `Disponível: ${material.quantidade_estoque}, solicitado: ${item.quantidade}`,
        );
      }
    }

    // 3. Executa em transação
    return this.prisma.$transaction(async (tx) => {
      const gastos: Record<string, unknown>[] = [];

      for (const item of dto.itens) {
        // Cria MaterialGasto
        const gasto = await tx.materialGasto.create({
          data: {
            os_id: dto.os_id,
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

        // Decrementa estoque
        await tx.material.update({
          where: { id: item.material_id },
          data: {
            quantidade_estoque: { decrement: item.quantidade },
          },
        });

        // Cria MovimentacaoEstoque
        await tx.movimentacaoEstoque.create({
          data: {
            material_id: item.material_id,
            tipo: 'SAIDA',
            quantidade: item.quantidade,
            os_id: dto.os_id,
            usuario_id: usuarioId,
            descricao: `Saída por OS`,
          },
        });

        gastos.push(gasto);
      }

      return gastos;
    });
  }

  async findByOs(osId: string) {
    const os = await this.prisma.ordemServico.findUnique({
      where: { id: osId },
    });

    if (!os) {
      throw new NotFoundException('Ordem de Serviço não encontrada');
    }

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
          select: {
            id: true,
            nameFull: true,
            funcao: true,
          },
        },
      },
    });
  }
}
