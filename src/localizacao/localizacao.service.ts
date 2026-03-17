import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Complexo } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLocalizacaoDto } from './dto/create-localizacao.dto';
import { UpdateLocalizacaoDto } from './dto/update-localizacao.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class LocalizacaoService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.localizacao.findMany({
      orderBy: { complexo: 'asc' },
    });
  }

  async findOne(id: string) {
    const localizacao = await this.prisma.localizacao.findUnique({
      where: { id },
    });

    if (!localizacao) {
      throw new NotFoundException('Localização não encontrada.');
    }

    return localizacao;
  }

  async findByComplexo(complexo: Complexo) {
    return await this.prisma.localizacao.findMany({
      where: { complexo },
      orderBy: { andar: 'asc' },
    });
  }

  async create(dto: CreateLocalizacaoDto) {
    // ✅ verifica duplicidade antes de criar
    const existe = await this.prisma.localizacao.findFirst({
      where: {
        complexo: dto.complexo,
        andar: dto.andar,
        area: dto.area ?? null,
      },
    });

    if (existe) {
      throw new ConflictException(
        'Já existe uma localização com esse complexo, andar e área.',
      );
    }

    try {
      return await this.prisma.localizacao.create({ data: dto });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Localização já cadastrada.');
        }
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateLocalizacaoDto) {
    await this.findOne(id); // ✅ await adicionado

    // ✅ verifica duplicidade ao atualizar (ignora o próprio registro)
    if (dto.complexo || dto.andar || dto.area !== undefined) {
      const atual = await this.prisma.localizacao.findUnique({ where: { id } });

      const existe = await this.prisma.localizacao.findFirst({
        where: {
          complexo: dto.complexo ?? atual!.complexo,
          andar: dto.andar ?? atual!.andar,
          area: dto.area ?? atual!.area,
          NOT: { id }, // ✅ ignora o próprio registro
        },
      });

      if (existe) {
        throw new ConflictException(
          'Já existe uma localização com esse complexo, andar e área.',
        );
      }
    }

    return this.prisma.localizacao.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.localizacao.delete({ where: { id } });
  }
}
