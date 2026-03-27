import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CategoriaEquipamento, StatusPreventiva } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePreventivaDto } from './dto/create-preventiva.dto';
import { UpdatePreventivaDto } from './dto/update-preventiva.dto';

const LIMITE_POR_CATEGORIA_POR_DIA = 2;

@Injectable()
export class PreventivaService {
  constructor(private prisma: PrismaService) {}

  private readonly includeRelations = {
    equipamento: {
      include: {
        categoria: true,
        localizacao: true,
      },
    },
    checklist: {
      include: {
        itens: { orderBy: { ordem: 'asc' as const } },
      },
    },
  };

  // ─── Helpers de agendamento ────────────────────────────────────────────────

  private isDomingo(date: Date): boolean {
    return date.getDay() === 0;
  }

  private proximoDiaUtil(from: Date): Date {
    const d = new Date(from);
    d.setHours(0, 0, 0, 0);
    if (this.isDomingo(d)) d.setDate(d.getDate() + 1);
    return d;
  }

  private async contarPreventivasDia(
    data: Date,
    categoria: CategoriaEquipamento,
  ): Promise<number> {
    const inicio = new Date(data);
    inicio.setHours(0, 0, 0, 0);
    const fim = new Date(data);
    fim.setHours(23, 59, 59, 999);

    return this.prisma.preventiva.count({
      where: {
        data_agendada: { gte: inicio, lte: fim },
        status: { not: StatusPreventiva.FINALIZADA },
        equipamento: { categoria: { categoria } },
      },
    });
  }

  private async calcularDataAgendada(
    categoriaEquipamento: CategoriaEquipamento,
    dataInicio?: string,
  ): Promise<Date> {
    let candidato = dataInicio ? new Date(dataInicio) : new Date();
    candidato = this.proximoDiaUtil(candidato);

    for (let tentativas = 0; tentativas < 365; tentativas++) {
      if (this.isDomingo(candidato)) {
        candidato.setDate(candidato.getDate() + 1);
        continue;
      }

      const count = await this.contarPreventivasDia(candidato, categoriaEquipamento);
      if (count < LIMITE_POR_CATEGORIA_POR_DIA) {
        return candidato;
      }

      candidato = new Date(candidato);
      candidato.setDate(candidato.getDate() + 1);
    }

    throw new BadRequestException(
      'Não foi possível encontrar uma data disponível para agendamento.',
    );
  }

  private async obterOuCriarChecklistPadrao(
    categoria: CategoriaEquipamento,
  ): Promise<string> {
    const nomePadrao = `Padrão - ${categoria === CategoriaEquipamento.Eletrica ? 'Elétrica' : 'Refrigeração'}`;

    let template = await this.prisma.checklistTemplate.findFirst({
      where: { nome: nomePadrao },
    });

    if (!template) {
      template = await this.prisma.checklistTemplate.create({
        data: {
          nome: nomePadrao,
          tipo: categoria,
          itens: {
            create: [
              { descricao: 'Inspeção geral do equipamento', ordem: 1, obrigatorio: true },
              { descricao: 'Verificação de anomalias visuais', ordem: 2, obrigatorio: true },
              { descricao: 'Limpeza e conservação', ordem: 3, obrigatorio: true },
              { descricao: 'Teste de funcionamento', ordem: 4, obrigatorio: true },
              { descricao: 'Registro de medições', ordem: 5, obrigatorio: false },
            ],
          },
        },
      });
    }

    return template.id;
  }

  // ─── CRUD ──────────────────────────────────────────────────────────────────

  async create(dto: CreatePreventivaDto) {
    const equipamento = await this.prisma.equipamentos.findUnique({
      where: { id: dto.equipamento_id },
      include: { categoria: true },
    });

    if (!equipamento) {
      throw new NotFoundException('Equipamento não encontrado.');
    }

    const categoria = equipamento.categoria.categoria;
    const dataInicio = dto.data_inicio ?? (() => {
      const d = new Date();
      d.setDate(d.getDate() + dto.frequencia_dias);
      return d.toISOString();
    })();
    const dataAgendada = await this.calcularDataAgendada(categoria, dataInicio);

    const checklistId =
      dto.checklist_id ?? (await this.obterOuCriarChecklistPadrao(categoria));

    return this.prisma.preventiva.create({
      data: {
        equipamento_id: dto.equipamento_id,
        checklist_id: checklistId,
        frequencia_dias: dto.frequencia_dias,
        data_agendada: dataAgendada,
        status: StatusPreventiva.AGENDADA,
      },
      include: this.includeRelations,
    });
  }

  async findAll(params?: {
    status?: StatusPreventiva;
    mes?: string; // formato: "2026-03"
    categoria?: CategoriaEquipamento;
  }) {
    const where: Record<string, unknown> = {};

    if (params?.status) {
      where.status = params.status;
    }

    if (params?.mes) {
      const [ano, mes] = params.mes.split('-').map(Number);
      const inicio = new Date(ano, mes - 1, 1);
      const fim = new Date(ano, mes, 0, 23, 59, 59, 999);
      where.data_agendada = { gte: inicio, lte: fim };
    }

    if (params?.categoria) {
      where.equipamento = { categoria: { categoria: params.categoria } };
    }

    return this.prisma.preventiva.findMany({
      where,
      include: this.includeRelations,
      orderBy: { data_agendada: 'asc' },
    });
  }

  async findOne(id: string) {
    const preventiva = await this.prisma.preventiva.findUnique({
      where: { id },
      include: this.includeRelations,
    });

    if (!preventiva) throw new NotFoundException('Preventiva não encontrada.');
    return preventiva;
  }

  async update(id: string, dto: UpdatePreventivaDto) {
    await this.findOne(id);

    const data: Record<string, unknown> = {};
    if (dto.status) data.status = dto.status;
    if (dto.data_finalizada) data.data_finalizada = new Date(dto.data_finalizada);
    if (dto.frequencia_dias) data.frequencia_dias = dto.frequencia_dias;
    if (dto.data_agendada) data.data_agendada = new Date(dto.data_agendada);
    if (dto.checklist_resultado !== undefined) data.checklist_resultado = dto.checklist_resultado;
    if (dto.observacoes !== undefined) data.observacoes = dto.observacoes;

    return this.prisma.preventiva.update({
      where: { id },
      data,
      include: this.includeRelations,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.preventiva.delete({ where: { id } });
  }

  // ─── Stats por mês ─────────────────────────────────────────────────────────

  async getStats(mes?: string) {
    const agora = new Date();
    const mesAtual = mes ?? `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}`;
    const [ano, mesNum] = mesAtual.split('-').map(Number);

    const inicioMes = new Date(ano, mesNum - 1, 1);
    const fimMes = new Date(ano, mesNum, 0, 23, 59, 59, 999);

    // Mês anterior
    const mesAnteriorDate = new Date(ano, mesNum - 2, 1);
    const inicioMesAnterior = new Date(mesAnteriorDate.getFullYear(), mesAnteriorDate.getMonth(), 1);
    const fimMesAnterior = new Date(mesAnteriorDate.getFullYear(), mesAnteriorDate.getMonth() + 1, 0, 23, 59, 59, 999);

    const [agendadasMes, finalizadasMes, atrasadasMes, naoFinalizadasMesAnterior] =
      await Promise.all([
        this.prisma.preventiva.count({
          where: {
            data_agendada: { gte: inicioMes, lte: fimMes },
            status: { in: [StatusPreventiva.AGENDADA, StatusPreventiva.EM_EXECUCAO] },
          },
        }),
        this.prisma.preventiva.count({
          where: {
            data_agendada: { gte: inicioMes, lte: fimMes },
            status: StatusPreventiva.FINALIZADA,
          },
        }),
        this.prisma.preventiva.count({
          where: {
            data_agendada: { lte: agora },
            status: { in: [StatusPreventiva.AGENDADA, StatusPreventiva.ATRASADA] },
          },
        }),
        this.prisma.preventiva.count({
          where: {
            data_agendada: { gte: inicioMesAnterior, lte: fimMesAnterior },
            status: { not: StatusPreventiva.FINALIZADA },
          },
        }),
      ]);

    return {
      mes: mesAtual,
      agendadas: agendadasMes,
      finalizadas: finalizadasMes,
      vencidas: atrasadasMes,
      atrasadasMesAnterior: naoFinalizadasMesAnterior,
    };
  }
}
