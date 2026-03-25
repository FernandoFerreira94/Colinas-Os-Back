import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CategoriaEquipamento, StatusPreventiva } from '@prisma/client';
import { PreventivaService } from './preventiva.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePreventivaDto } from './dto/create-preventiva.dto';
import { UpdatePreventivaDto } from './dto/update-preventiva.dto';

// ─── Mock do PrismaService ──────────────────────────────────────────────────

const mockPrisma = {
  preventiva: {
    count: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  equipamentos: {
    findUnique: jest.fn(),
  },
  checklistTemplate: {
    findFirst: jest.fn(),
    create: jest.fn(),
  },
};

// ─── Fixtures ───────────────────────────────────────────────────────────────

const mockCategoria = {
  id: 'cat-1',
  categoria: CategoriaEquipamento.Eletrica,
  tag: 'QD',
  tipo: 'Quadro de Distribuição',
};

const mockEquipamento = {
  id: 'equip-1',
  name_equipamento: 'Quadro Elétrico Principal',
  tag_formatada: 'QD-01',
  categoria_id: 'cat-1',
  categoria: mockCategoria,
};

const mockTemplate = {
  id: 'tmpl-1',
  nome: 'Padrão - Elétrica',
  tipo: 'Eletrica',
  itens: [],
};

const mockPreventiva = {
  id: 'prev-1',
  equipamento_id: 'equip-1',
  checklist_id: 'tmpl-1',
  frequencia_dias: 30,
  status: StatusPreventiva.AGENDADA,
  data_agendada: new Date('2026-03-25T00:00:00.000Z'),
  data_finalizada: null,
  created_at: new Date('2026-03-25T00:00:00.000Z'),
  equipamento: mockEquipamento,
  checklist: { ...mockTemplate, preventivas: [], itens: [] },
};

// ─── Testes ─────────────────────────────────────────────────────────────────

describe('PreventivaService', () => {
  let service: PreventivaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PreventivaService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<PreventivaService>(PreventivaService);
    jest.clearAllMocks();
  });

  // ─── create ─────────────────────────────────────────────────────────────

  describe('create()', () => {
    const dto: CreatePreventivaDto = {
      equipamento_id: 'equip-1',
      frequencia_dias: 30,
      data_inicio: '2026-03-26', // Quarta-feira
    };

    it('cria preventiva com checklist padrão quando nenhum é fornecido', async () => {
      mockPrisma.equipamentos.findUnique.mockResolvedValue(mockEquipamento);
      mockPrisma.preventiva.count.mockResolvedValue(0); // data disponível
      mockPrisma.checklistTemplate.findFirst.mockResolvedValue(null); // sem template
      mockPrisma.checklistTemplate.create.mockResolvedValue(mockTemplate);
      mockPrisma.preventiva.create.mockResolvedValue(mockPreventiva);

      const result = await service.create(dto);

      expect(mockPrisma.equipamentos.findUnique).toHaveBeenCalledWith({
        where: { id: 'equip-1' },
        include: { categoria: true },
      });
      expect(mockPrisma.checklistTemplate.findFirst).toHaveBeenCalled();
      expect(mockPrisma.checklistTemplate.create).toHaveBeenCalled();
      expect(mockPrisma.preventiva.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            equipamento_id: 'equip-1',
            checklist_id: 'tmpl-1',
            frequencia_dias: 30,
            status: StatusPreventiva.AGENDADA,
          }),
        }),
      );
      expect(result).toEqual(mockPreventiva);
    });

    it('reutiliza checklist existente quando encontrado', async () => {
      mockPrisma.equipamentos.findUnique.mockResolvedValue(mockEquipamento);
      mockPrisma.preventiva.count.mockResolvedValue(0);
      mockPrisma.checklistTemplate.findFirst.mockResolvedValue(mockTemplate);
      mockPrisma.preventiva.create.mockResolvedValue(mockPreventiva);

      await service.create(dto);

      expect(mockPrisma.checklistTemplate.create).not.toHaveBeenCalled();
      expect(mockPrisma.preventiva.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ checklist_id: 'tmpl-1' }),
        }),
      );
    });

    it('usa checklist_id fornecido no DTO sem buscar padrão', async () => {
      const dtoComChecklist: CreatePreventivaDto = {
        ...dto,
        checklist_id: 'tmpl-custom',
      };
      mockPrisma.equipamentos.findUnique.mockResolvedValue(mockEquipamento);
      mockPrisma.preventiva.count.mockResolvedValue(0);
      mockPrisma.preventiva.create.mockResolvedValue(mockPreventiva);

      await service.create(dtoComChecklist);

      expect(mockPrisma.checklistTemplate.findFirst).not.toHaveBeenCalled();
      expect(mockPrisma.checklistTemplate.create).not.toHaveBeenCalled();
      expect(mockPrisma.preventiva.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ checklist_id: 'tmpl-custom' }),
        }),
      );
    });

    it('lança NotFoundException quando equipamento não existe', async () => {
      mockPrisma.equipamentos.findUnique.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });

    it('avança para próximo dia quando limite diário por categoria é atingido', async () => {
      mockPrisma.equipamentos.findUnique.mockResolvedValue(mockEquipamento);
      // Primeira data lotada, segunda disponível
      mockPrisma.preventiva.count
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce(0);
      mockPrisma.checklistTemplate.findFirst.mockResolvedValue(mockTemplate);
      mockPrisma.preventiva.create.mockResolvedValue(mockPreventiva);

      await service.create(dto);

      // count foi chamado pelo menos 2 vezes (uma por dia candidato)
      expect(mockPrisma.preventiva.count).toHaveBeenCalledTimes(2);
    });

    it('lança BadRequestException quando não encontra data após 365 tentativas', async () => {
      mockPrisma.equipamentos.findUnique.mockResolvedValue(mockEquipamento);
      mockPrisma.preventiva.count.mockResolvedValue(2); // sempre lotado

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });
  });

  // ─── Agendamento: regras de domingo ──────────────────────────────────────

  describe('agendamento — regras de domimgo', () => {
    it('pula domingos automaticamente no agendamento', async () => {
      const dto: CreatePreventivaDto = {
        equipamento_id: 'equip-1',
        frequencia_dias: 7,
        data_inicio: '2026-03-29', // Domingo
      };

      mockPrisma.equipamentos.findUnique.mockResolvedValue(mockEquipamento);
      mockPrisma.preventiva.count.mockResolvedValue(0);
      mockPrisma.checklistTemplate.findFirst.mockResolvedValue(mockTemplate);
      mockPrisma.preventiva.create.mockResolvedValue(mockPreventiva);

      await service.create(dto);

      const createCall = mockPrisma.preventiva.create.mock.calls[0][0];
      const dataAgendada: Date = createCall.data.data_agendada;

      // Dia da semana: 0 = domingo. A data agendada NÃO pode ser domingo
      expect(dataAgendada.getDay()).not.toBe(0);
    });
  });

  // ─── findAll ─────────────────────────────────────────────────────────────

  describe('findAll()', () => {
    it('retorna todas as preventivas sem filtros', async () => {
      mockPrisma.preventiva.findMany.mockResolvedValue([mockPreventiva]);

      const result = await service.findAll();

      expect(mockPrisma.preventiva.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} }),
      );
      expect(result).toEqual([mockPreventiva]);
    });

    it('filtra por status', async () => {
      mockPrisma.preventiva.findMany.mockResolvedValue([mockPreventiva]);

      await service.findAll({ status: StatusPreventiva.AGENDADA });

      expect(mockPrisma.preventiva.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: StatusPreventiva.AGENDADA,
          }),
        }),
      );
    });

    it('filtra por mês no formato YYYY-MM', async () => {
      mockPrisma.preventiva.findMany.mockResolvedValue([mockPreventiva]);

      await service.findAll({ mes: '2026-03' });

      expect(mockPrisma.preventiva.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            data_agendada: expect.objectContaining({
              gte: new Date(2026, 2, 1),
              lte: new Date(2026, 2, 31, 23, 59, 59, 999),
            }),
          }),
        }),
      );
    });

    it('filtra por categoria de equipamento', async () => {
      mockPrisma.preventiva.findMany.mockResolvedValue([mockPreventiva]);

      await service.findAll({ categoria: CategoriaEquipamento.Refrigeracao });

      expect(mockPrisma.preventiva.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            equipamento: {
              categoria: { categoria: CategoriaEquipamento.Refrigeracao },
            },
          }),
        }),
      );
    });

    it('retorna lista ordenada por data_agendada ascendente', async () => {
      mockPrisma.preventiva.findMany.mockResolvedValue([]);

      await service.findAll();

      expect(mockPrisma.preventiva.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { data_agendada: 'asc' } }),
      );
    });
  });

  // ─── findOne ─────────────────────────────────────────────────────────────

  describe('findOne()', () => {
    it('retorna a preventiva pelo id', async () => {
      mockPrisma.preventiva.findUnique.mockResolvedValue(mockPreventiva);

      const result = await service.findOne('prev-1');

      expect(mockPrisma.preventiva.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'prev-1' } }),
      );
      expect(result).toEqual(mockPreventiva);
    });

    it('lança NotFoundException quando preventiva não encontrada', async () => {
      mockPrisma.preventiva.findUnique.mockResolvedValue(null);

      await expect(service.findOne('inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── update ──────────────────────────────────────────────────────────────

  describe('update()', () => {
    it('atualiza o status da preventiva', async () => {
      const dto: UpdatePreventivaDto = { status: StatusPreventiva.EM_EXECUCAO };
      const atualizada = { ...mockPreventiva, status: StatusPreventiva.EM_EXECUCAO };

      mockPrisma.preventiva.findUnique.mockResolvedValue(mockPreventiva);
      mockPrisma.preventiva.update.mockResolvedValue(atualizada);

      const result = await service.update('prev-1', dto);

      expect(mockPrisma.preventiva.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'prev-1' },
          data: { status: StatusPreventiva.EM_EXECUCAO },
        }),
      );
      expect(result.status).toBe(StatusPreventiva.EM_EXECUCAO);
    });

    it('atualiza data_finalizada convertendo string ISO para Date', async () => {
      const dto: UpdatePreventivaDto = {
        status: StatusPreventiva.FINALIZADA,
        data_finalizada: '2026-03-25T10:00:00.000Z',
      };

      mockPrisma.preventiva.findUnique.mockResolvedValue(mockPreventiva);
      mockPrisma.preventiva.update.mockResolvedValue({
        ...mockPreventiva,
        status: StatusPreventiva.FINALIZADA,
        data_finalizada: new Date('2026-03-25T10:00:00.000Z'),
      });

      await service.update('prev-1', dto);

      expect(mockPrisma.preventiva.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            data_finalizada: new Date('2026-03-25T10:00:00.000Z'),
          }),
        }),
      );
    });

    it('lança NotFoundException ao atualizar id inexistente', async () => {
      mockPrisma.preventiva.findUnique.mockResolvedValue(null);

      await expect(
        service.update('inexistente', { status: StatusPreventiva.FINALIZADA }),
      ).rejects.toThrow(NotFoundException);

      expect(mockPrisma.preventiva.update).not.toHaveBeenCalled();
    });
  });

  // ─── remove ──────────────────────────────────────────────────────────────

  describe('remove()', () => {
    it('remove a preventiva pelo id', async () => {
      mockPrisma.preventiva.findUnique.mockResolvedValue(mockPreventiva);
      mockPrisma.preventiva.delete.mockResolvedValue(mockPreventiva);

      const result = await service.remove('prev-1');

      expect(mockPrisma.preventiva.delete).toHaveBeenCalledWith({
        where: { id: 'prev-1' },
      });
      expect(result).toEqual(mockPreventiva);
    });

    it('lança NotFoundException ao remover id inexistente', async () => {
      mockPrisma.preventiva.findUnique.mockResolvedValue(null);

      await expect(service.remove('inexistente')).rejects.toThrow(
        NotFoundException,
      );

      expect(mockPrisma.preventiva.delete).not.toHaveBeenCalled();
    });
  });

  // ─── getStats ────────────────────────────────────────────────────────────

  describe('getStats()', () => {
    beforeEach(() => {
      // Promise.all de 4 counts
      mockPrisma.preventiva.count
        .mockResolvedValueOnce(8)   // agendadas do mês
        .mockResolvedValueOnce(5)   // finalizadas do mês
        .mockResolvedValueOnce(2)   // atrasadas (vencidas)
        .mockResolvedValueOnce(3);  // não finalizadas do mês anterior
    });

    it('retorna estatísticas com mês atual quando não informado', async () => {
      const result = await service.getStats();

      expect(mockPrisma.preventiva.count).toHaveBeenCalledTimes(4);
      expect(result).toMatchObject({
        agendadas: 8,
        finalizadas: 5,
        vencidas: 2,
        atrasadasMesAnterior: 3,
      });
      expect(result.mes).toMatch(/^\d{4}-\d{2}$/);
    });

    it('retorna estatísticas para mês específico', async () => {
      const result = await service.getStats('2026-03');

      expect(result.mes).toBe('2026-03');
      expect(result.agendadas).toBe(8);
      expect(result.finalizadas).toBe(5);
      expect(result.vencidas).toBe(2);
      expect(result.atrasadasMesAnterior).toBe(3);
    });

    it('gera filtro correto para agendadas do mês', async () => {
      await service.getStats('2026-03');

      const primeiroCount = mockPrisma.preventiva.count.mock.calls[0][0];
      expect(primeiroCount.where).toMatchObject({
        data_agendada: {
          gte: new Date(2026, 2, 1),
          lte: new Date(2026, 2, 31, 23, 59, 59, 999),
        },
        status: {
          in: [StatusPreventiva.AGENDADA, StatusPreventiva.EM_EXECUCAO],
        },
      });
    });

    it('gera filtro correto para finalizadas do mês', async () => {
      await service.getStats('2026-03');

      const segundoCount = mockPrisma.preventiva.count.mock.calls[1][0];
      expect(segundoCount.where).toMatchObject({
        status: StatusPreventiva.FINALIZADA,
      });
    });
  });
});
