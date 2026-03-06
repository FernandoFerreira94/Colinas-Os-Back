import { Injectable, NotFoundException } from '@nestjs/common';
import { Categoria_Equipamento } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { Create_Categoria_equipamentoDto } from './dto/create_categoria_equipamento.dto';

@Injectable()
export class CategoriaEquipamentoService {
  constructor(private prisma: PrismaService) {}

  async findCategoriaAll(): Promise<Categoria_Equipamento[]> {
    const usersAll = await this.prisma.categoria_Equipamento.findMany();
    return usersAll;
  }

  async createCategoria_equipamento(
    createCategoria_equipamento: Create_Categoria_equipamentoDto,
  ): Promise<Categoria_Equipamento> {
    const categoria_tipo_exists =
      await this.prisma.categoria_Equipamento.findUnique({
        where: {
          tipo: createCategoria_equipamento.tipo,
          tag: createCategoria_equipamento.tag,
        },
      });

    if (categoria_tipo_exists) {
      throw new NotFoundException('Tipo de equipamento já existente');
    }
    const data = await this.prisma.categoria_Equipamento.create({
      data: createCategoria_equipamento,
    });
    return data;
  }
}
