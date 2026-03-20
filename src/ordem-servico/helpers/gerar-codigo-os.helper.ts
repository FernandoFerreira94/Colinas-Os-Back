import { TipoOS } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

const PREFIXO_CATEGORIA: Record<string, string> = {
  Elétrica: 'EL',
  Refrigeração: 'RF',
  Civil: 'CV',
  Hidráulica: 'HI',
  'Dados / TI': 'TI',
  Outros: 'OT',
};

function obterPrefixo(tipo: TipoOS, categoria?: string | null): string {
  if (tipo === 'PREVENTIVA') return 'PV';
  if (tipo === 'ACOMPANHAMENTO') return 'AC';
  if (categoria && PREFIXO_CATEGORIA[categoria]) {
    return PREFIXO_CATEGORIA[categoria];
  }
  if (tipo === 'MELHORIA') return 'ML';
  if (tipo === 'CORRETIVA') return 'EL'; // fallback
  return 'OS';
}

export async function gerarCodigoOS(
  prisma: PrismaService | Parameters<Parameters<PrismaService['$transaction']>[0]>[0],
  tipo: TipoOS,
  categoria?: string | null,
): Promise<string> {
  const prefixo = obterPrefixo(tipo, categoria);

  const ultima = await (prisma as PrismaService).ordemServico.findFirst({
    where: { codigo: { startsWith: prefixo + '-' } },
    orderBy: { codigo: 'desc' },
    select: { codigo: true },
  });

  let proximo = 1;
  if (ultima?.codigo) {
    const partes = ultima.codigo.split('-');
    const num = parseInt(partes[1], 10);
    if (!isNaN(num)) proximo = num + 1;
  }

  return `${prefixo}-${String(proximo).padStart(4, '0')}`;
}
