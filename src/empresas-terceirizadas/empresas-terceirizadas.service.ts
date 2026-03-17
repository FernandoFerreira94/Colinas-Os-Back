import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEmpresaTerceirizadaDto } from './dto/create-empresa-terceirizada.dto';
import { UpdateEmpresaTerceirizadaDto } from './dto/update-empresa-terceirizada.dto';

@Injectable()
export class EmpresasTerceirizadasService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.empresaTerceirizada.findMany({
      orderBy: { nome: 'asc' },
    });
  }

  async findOne(id: string) {
    const empresa = await this.prisma.empresaTerceirizada.findUnique({
      where: { id },
    });

    if (!empresa) {
      throw new NotFoundException('Empresa terceirizada não encontrada.');
    }

    return empresa;
  }

  async create(dto: CreateEmpresaTerceirizadaDto) {
    if (dto.cnpj) {
      const existe = await this.prisma.empresaTerceirizada.findUnique({
        where: { cnpj: dto.cnpj },
      });

      if (existe) {
        throw new ConflictException('Já existe uma empresa com esse CNPJ.');
      }
    }

    return this.prisma.empresaTerceirizada.create({ data: dto });
  }

  async update(id: string, dto: UpdateEmpresaTerceirizadaDto) {
    await this.findOne(id);

    if (dto.cnpj) {
      const existe = await this.prisma.empresaTerceirizada.findFirst({
        where: {
          cnpj: dto.cnpj,
          NOT: { id },
        },
      });

      if (existe) {
        throw new ConflictException('Já existe uma empresa com esse CNPJ.');
      }
    }

    return this.prisma.empresaTerceirizada.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.empresaTerceirizada.delete({ where: { id } });
  }
}
