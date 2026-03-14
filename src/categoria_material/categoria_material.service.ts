// ─── categoria-material.service.ts ───────────────────────────────────────────
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { CreateCategoriaDto } from './dto/createCategoriaMaterial.dto';
import { CreateSubCategoriaDto } from 'src/categoria_material/dto/createSubCategoria.dto';

import { SubCategoria_Material } from './entities/subCategoriaMaterial.entity';

@Injectable()
export class CategoriaMaterialService {
  constructor(private readonly prisma: PrismaService) {}

  async createCategoria(dto: CreateCategoriaDto) {
    const existCategoria = await this.prisma.categoria_Material.findFirst({
      where: { categoria: dto.categoria },
    });

    if (existCategoria) {
      throw new ConflictException('Categoria ja cadastrada');
    }
    try {
      return await this.prisma.categoria_Material.create({
        data: {
          categoria: dto.categoria,
        },
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      )
        throw error;
    }
  }

  async createSubCategoria(
    dto: CreateSubCategoriaDto,
  ): Promise<SubCategoria_Material> {
    try {
      return await this.prisma.subCategoria_Material.create({
        data: {
          subCategoria: dto.subCategoria,
          categoria_id: dto.categoria_id,
        },
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          `SubCategoria "${dto.subCategoria}" já existe nessa categoria`,
        );
      }
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new ConflictException(
          `Categoria com id "${dto.categoria_id}" não encontrada`,
        );
      }
      throw error;
    }
  }

  async findCategoriaAll() {
    try {
      const categoriaAll = await this.prisma.categoria_Material.findMany();
      return categoriaAll;
    } catch (error) {
      console.log(error);
      throw new NotFoundException('Nenhuma categoria encontrada');
    }
  }

  async findSubCategoriaAll() {
    try {
      return await this.prisma.subCategoria_Material.findMany({
        include: {
          categoria: true,
        },
      });
    } catch (error) {
      console.log(error);
      throw new NotFoundException('Nenhuma Sub categoria encontrada');
    }
  }
}
