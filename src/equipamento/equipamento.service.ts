import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Create_EquipamentoDto } from './dto/create_equipamento.det';
import { EquipamentoProps } from './entities/equipamento.entity';
import { Categoria, Prisma } from '@prisma/client';
@Injectable()
export class EquipamentoService {
  constructor(private prisma: PrismaService) {}

  async createEquipamento(
    createEqupamento: Create_EquipamentoDto,
  ): Promise<EquipamentoProps> {
    try {
      // Busca o maior num_tag da categoria para gerar o próximo
      const ultimo = await this.prisma.equipamentos.findFirst({
        where: { categoria_id: createEqupamento.categoria_id },
        orderBy: { num_tag: 'desc' },
      });

      const proximo_num_tag = ultimo ? ultimo.num_tag + 1 : 1;

      const data = await this.prisma.equipamentos.create({
        data: {
          ...createEqupamento,
          num_tag: proximo_num_tag,
        },
      });

      return data;
    } catch (error) {
      console.log(error);
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

  async findAllEquipamentos(): Promise<EquipamentoProps[]> {
    const equipamentosAll = await this.prisma.equipamentos.findMany({
      include: {
        ordens_servico: true,
        categoria: true, // 👈
      },
    });
    return equipamentosAll;
  }

  async getEquipamentos(filter?: string) {
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
