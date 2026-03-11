import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Create_EquipamentoDto } from './dto/create_equipamento.dto';
import { Categoria, Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { UpdateEquipamentoDto } from './dto/update_equipamento.dto';

@Injectable()
export class EquipamentoService {
  constructor(private prisma: PrismaService) {}

  async createEquipamento(createEqupamento: Create_EquipamentoDto) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        // 👇 busca a categoria para pegar a tag (ex: "AC", "GE")
        const categoria = await tx.categoria_Equipamento.findUnique({
          where: { id: createEqupamento.categoria_id },
          select: { tag: true },
        });

        if (!categoria) {
          throw new NotFoundException('Categoria não encontrada.');
        }

        // 👇 busca o último num_tag dentro da mesma categoria
        const ultimo = await tx.equipamentos.findFirst({
          where: { categoria_id: createEqupamento.categoria_id },
          orderBy: { num_tag: 'desc' },
          select: { num_tag: true },
        });

        const proximo_num_tag = ultimo ? ultimo.num_tag + 1 : 1;

        // 👇 gera "AC-01", "GE-03"...
        const tag_formatada = `${categoria.tag}-${String(proximo_num_tag).padStart(2, '0')}`;

        return await tx.equipamentos.create({
          data: {
            ...createEqupamento,
            num_tag: proximo_num_tag,
            tag_formatada,
          },
        });
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Equipamento já cadastrado.');
        }
        if (error.code === 'P2025') {
          throw new NotFoundException('Categoria não encontrada.');
        }
      }
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Erro ao criar equipamento');
    }
  }

  async getProximoNumTag(categoria_id: string): Promise<number> {
    const ultimo = await this.prisma.equipamentos.findFirst({
      where: { categoria_id },
      orderBy: { num_tag: 'desc' },
    });

    return ultimo ? ultimo.num_tag + 1 : 1;
  }

  async findAllEquipamentos() {
    const equipamentosAll = await this.prisma.equipamentos.findMany({
      include: {
        ordens_servico: true,
        categoria: true, // 👈
      },
    });
    return equipamentosAll;
  }

  async getEquipamentosFilter(filter?: string) {
    try {
      const where: Prisma.EquipamentosWhereInput =
        filter === 'Ativo'
          ? { ativo: true }
          : filter === 'Inativo'
            ? { ativo: false }
            : filter === 'Todos' || !filter
              ? {}
              : { categoria: { is: { categoria: filter as Categoria } } }; // 👈 is para relação

      return this.prisma.equipamentos.findMany({
        where,
        include: {
          ordens_servico: true,
          categoria: true, // 👈
        },
        orderBy: {
          num_tag: 'asc',
        },
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Erro ao buscar equipamentos');
    }
  }

  async getEquipamentoId(id: string) {
    try {
      return this.prisma.equipamentos.findUnique({
        where: { id },
        include: {
          ordens_servico: true,
          categoria: true, // 👈
        },
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Erro ao buscar equipamento');
    }
  }

  // equipamento.service.ts — adicione esse método
  async updateEquipamento(id: string, updateDto: UpdateEquipamentoDto) {
    try {
      // 👇 verifica se o equipamento existe
      const equipamento = await this.prisma.equipamentos.findUnique({
        where: { id },
      });

      if (!equipamento) {
        throw new NotFoundException(`Equipamento não encontrado.`);
      }

      // 👇 se categoria_id mudou, verifica se a nova categoria existe
      if (updateDto.categoria_id) {
        const categoriaExiste =
          await this.prisma.categoria_Equipamento.findUnique({
            where: { id: updateDto.categoria_id },
          });

        if (!categoriaExiste) {
          throw new NotFoundException(`Categoria não encontrada.`);
        }
      }

      return await this.prisma.equipamentos.update({
        where: { id },
        data: updateDto,
        include: {
          categoria: true,
          ordens_servico: true,
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Equipamento não encontrado.');
        }
      }
      throw new InternalServerErrorException('Erro ao atualizar equipamento');
    }
  }

  async deleteEquipamento(delete_id: string) {
    try {
      const del = await this.prisma.equipamentos.delete({
        where: { id: delete_id },
      });
      return del;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Erro ao deletar equipamento');
    }
  }
}
