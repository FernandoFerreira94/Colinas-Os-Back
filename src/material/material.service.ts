// material.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMaterialDto } from './dto/createMaterial.dto';
import { UpdateMaterialDto } from './dto/updateMaterial.dto';

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

  async findAll() {
    return await this.prisma.material.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        subcategoria: true,
      },
    });
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
