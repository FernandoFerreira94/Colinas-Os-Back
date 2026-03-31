import { PrismaClient, Complexo, Unidade } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de materiais...');

  // ─── Categorias ────────────────────────────────────────────────────────────

  const eletrica = await prisma.categoria_Material.upsert({
    where: { categoria: 'Elétrica' },
    update: {},
    create: { categoria: 'Elétrica' },
  });

  const refrigeracao = await prisma.categoria_Material.upsert({
    where: { categoria: 'Refrigeração' },
    update: {},
    create: { categoria: 'Refrigeração' },
  });

  const hidraulica = await prisma.categoria_Material.upsert({
    where: { categoria: 'Hidráulica' },
    update: {},
    create: { categoria: 'Hidráulica' },
  });

  console.log('✅ Categorias criadas');

  // ─── Subcategorias ─────────────────────────────────────────────────────────

  const subEletrica = await prisma.subCategoria_Material.upsert({
    where: { subCategoria_categoria_id: { subCategoria: 'Cabos e Fios', categoria_id: eletrica.id } },
    update: {},
    create: { subCategoria: 'Cabos e Fios', categoria_id: eletrica.id },
  });

  const subEletrica2 = await prisma.subCategoria_Material.upsert({
    where: { subCategoria_categoria_id: { subCategoria: 'Proteção e Comando', categoria_id: eletrica.id } },
    update: {},
    create: { subCategoria: 'Proteção e Comando', categoria_id: eletrica.id },
  });

  const subRefrigeracao = await prisma.subCategoria_Material.upsert({
    where: { subCategoria_categoria_id: { subCategoria: 'Componentes de Ar', categoria_id: refrigeracao.id } },
    update: {},
    create: { subCategoria: 'Componentes de Ar', categoria_id: refrigeracao.id },
  });

  const subHidraulica = await prisma.subCategoria_Material.upsert({
    where: { subCategoria_categoria_id: { subCategoria: 'Tubulação e Conexões', categoria_id: hidraulica.id } },
    update: {},
    create: { subCategoria: 'Tubulação e Conexões', categoria_id: hidraulica.id },
  });

  console.log('✅ Subcategorias criadas');

  // ─── Materiais — Elétrica ──────────────────────────────────────────────────

  await prisma.material.upsert({
    where: { codigo: 'EL-001' },
    update: {},
    create: {
      codigo: 'EL-001',
      descricao: 'Cabo PP 2x2,5mm (flexível)',
      unidade: Unidade.Mt,
      quantidade_estoque: 150,
      quantidade_minima: 30,
      departamento: Complexo.SHOPPING_COLINAS,
      marca: 'Prysmian',
      price: 8.9,
      subcategoriaId: subEletrica.id,
    },
  });

  await prisma.material.upsert({
    where: { codigo: 'EL-002' },
    update: {},
    create: {
      codigo: 'EL-002',
      descricao: 'Disjuntor Monopolar 20A',
      unidade: Unidade.Un,
      quantidade_estoque: 25,
      quantidade_minima: 5,
      departamento: Complexo.SHOPPING_COLINAS,
      marca: 'Schneider',
      price: 32.5,
      subcategoriaId: subEletrica2.id,
    },
  });

  await prisma.material.upsert({
    where: { codigo: 'EL-003' },
    update: {},
    create: {
      codigo: 'EL-003',
      descricao: 'Tomada 2P+T 10A',
      unidade: Unidade.Un,
      quantidade_estoque: 40,
      quantidade_minima: 10,
      departamento: Complexo.GREEN_TOWER,
      marca: 'Tramontina',
      price: 12.0,
      subcategoriaId: subEletrica2.id,
    },
  });

  // ─── Materiais — Refrigeração ──────────────────────────────────────────────

  await prisma.material.upsert({
    where: { codigo: 'RF-001' },
    update: {},
    create: {
      codigo: 'RF-001',
      descricao: 'Filtro Secador 1/4" (bivolt)',
      unidade: Unidade.Un,
      quantidade_estoque: 12,
      quantidade_minima: 3,
      departamento: Complexo.SHOPPING_COLINAS,
      marca: 'Carel',
      price: 28.0,
      subcategoriaId: subRefrigeracao.id,
    },
  });

  await prisma.material.upsert({
    where: { codigo: 'RF-002' },
    update: {},
    create: {
      codigo: 'RF-002',
      descricao: 'Gás Refrigerante R-410A (botijão 11,3kg)',
      unidade: Unidade.Kg,
      quantidade_estoque: 3,
      quantidade_minima: 1,
      departamento: Complexo.SHOPPING_COLINAS,
      marca: 'Dupont',
      price: 320.0,
      subcategoriaId: subRefrigeracao.id,
    },
  });

  await prisma.material.upsert({
    where: { codigo: 'RF-003' },
    update: {},
    create: {
      codigo: 'RF-003',
      descricao: 'Capacitor Duplo 40+5 μF 440V',
      unidade: Unidade.Un,
      quantidade_estoque: 8,
      quantidade_minima: 2,
      departamento: Complexo.GREEN_TOWER,
      marca: 'WEG',
      price: 45.0,
      subcategoriaId: subRefrigeracao.id,
    },
  });

  // ─── Materiais — Hidráulica ────────────────────────────────────────────────

  await prisma.material.upsert({
    where: { codigo: 'HI-001' },
    update: {},
    create: {
      codigo: 'HI-001',
      descricao: 'Tubo PVC Soldável 25mm (barra 6m)',
      unidade: Unidade.Mt,
      quantidade_estoque: 60,
      quantidade_minima: 12,
      departamento: Complexo.SHOPPING_COLINAS,
      marca: 'Amanco',
      price: 18.5,
      subcategoriaId: subHidraulica.id,
    },
  });

  await prisma.material.upsert({
    where: { codigo: 'HI-002' },
    update: {},
    create: {
      codigo: 'HI-002',
      descricao: 'Registro de Esfera 3/4" (bronze)',
      unidade: Unidade.Un,
      quantidade_estoque: 15,
      quantidade_minima: 4,
      departamento: Complexo.SHOPPING_COLINAS,
      marca: 'Docol',
      price: 22.0,
      subcategoriaId: subHidraulica.id,
    },
  });

  await prisma.material.upsert({
    where: { codigo: 'HI-003' },
    update: {},
    create: {
      codigo: 'HI-003',
      descricao: 'Joelho 90° PVC 25mm',
      unidade: Unidade.Un,
      quantidade_estoque: 80,
      quantidade_minima: 20,
      departamento: Complexo.ESTACIONAMENTO,
      marca: 'Amanco',
      price: 2.5,
      subcategoriaId: subHidraulica.id,
    },
  });

  console.log('✅ 9 Materiais criados (3 por categoria)');

  // ─── Materiais extras — Elétrica ──────────────────────────────────────────

  await prisma.material.upsert({
    where: { codigo: 'EL-004' },
    update: {},
    create: {
      codigo: 'EL-004',
      descricao: 'Disjuntor Tripolar 63A',
      unidade: Unidade.Un,
      quantidade_estoque: 10,
      quantidade_minima: 2,
      departamento: Complexo.SHOPPING_COLINAS,
      marca: 'Schneider',
      price: 98.5,
      subcategoriaId: subEletrica2.id,
    },
  });

  await prisma.material.upsert({
    where: { codigo: 'EL-005' },
    update: {},
    create: {
      codigo: 'EL-005',
      descricao: 'Cabo Flexível 4mm² (preto)',
      unidade: Unidade.Mt,
      quantidade_estoque: 200,
      quantidade_minima: 50,
      departamento: Complexo.GREEN_TOWER,
      marca: 'Prysmian',
      price: 6.2,
      subcategoriaId: subEletrica.id,
    },
  });

  await prisma.material.upsert({
    where: { codigo: 'EL-006' },
    update: {},
    create: {
      codigo: 'EL-006',
      descricao: 'Contator LC1D25 220V',
      unidade: Unidade.Un,
      quantidade_estoque: 6,
      quantidade_minima: 2,
      departamento: Complexo.SHOPPING_COLINAS,
      marca: 'Schneider',
      price: 145.0,
      subcategoriaId: subEletrica2.id,
    },
  });

  await prisma.material.upsert({
    where: { codigo: 'EL-007' },
    update: {},
    create: {
      codigo: 'EL-007',
      descricao: 'Relé de Proteção Elétrica 24V',
      unidade: Unidade.Un,
      quantidade_estoque: 4,
      quantidade_minima: 1,
      departamento: Complexo.ESTACIONAMENTO,
      marca: 'ABB',
      price: 220.0,
      subcategoriaId: subEletrica2.id,
    },
  });

  // ─── Materiais extras — Hidráulica ────────────────────────────────────────

  await prisma.material.upsert({
    where: { codigo: 'HI-004' },
    update: {},
    create: {
      codigo: 'HI-004',
      descricao: 'Luva PVC Soldável 25mm',
      unidade: Unidade.Un,
      quantidade_estoque: 100,
      quantidade_minima: 20,
      departamento: Complexo.SHOPPING_COLINAS,
      marca: 'Amanco',
      price: 1.8,
      subcategoriaId: subHidraulica.id,
    },
  });

  await prisma.material.upsert({
    where: { codigo: 'HI-005' },
    update: {},
    create: {
      codigo: 'HI-005',
      descricao: 'Torneira de Bóia 3/4\" (plástica)',
      unidade: Unidade.Un,
      quantidade_estoque: 12,
      quantidade_minima: 3,
      departamento: Complexo.GREEN_TOWER,
      marca: 'Tigre',
      price: 35.0,
      subcategoriaId: subHidraulica.id,
    },
  });

  await prisma.material.upsert({
    where: { codigo: 'HI-006' },
    update: {},
    create: {
      codigo: 'HI-006',
      descricao: 'Bomba Pressurizadora 1/2 CV',
      unidade: Unidade.Un,
      quantidade_estoque: 2,
      quantidade_minima: 1,
      departamento: Complexo.SHOPPING_COLINAS,
      marca: 'Schneider',
      price: 680.0,
      subcategoriaId: subHidraulica.id,
    },
  });

  await prisma.material.upsert({
    where: { codigo: 'HI-007' },
    update: {},
    create: {
      codigo: 'HI-007',
      descricao: 'Mangueira Flexível 1/2\" (metro)',
      unidade: Unidade.Mt,
      quantidade_estoque: 50,
      quantidade_minima: 10,
      departamento: Complexo.ESTACIONAMENTO,
      marca: 'Tigre',
      price: 8.9,
      subcategoriaId: subHidraulica.id,
    },
  });

  console.log('✅ 8 Materiais extras criados (4 elétrica + 4 hidráulica)');

  // ─── Materiais de teste ────────────────────────────────────────────────────

  await prisma.material.upsert({
    where: { codigo: 'RF-004' },
    update: {},
    create: {
      codigo: 'RF-004',
      descricao: 'Filtro de Ar Split 12000 BTU',
      unidade: Unidade.Un,
      quantidade_estoque: 10,
      quantidade_minima: 2,
      departamento: Complexo.SHOPPING_COLINAS,
      marca: 'LG',
      price: 15.9,
      subcategoriaId: subRefrigeracao.id,
    },
  });

  await prisma.material.upsert({
    where: { codigo: 'RF-005' },
    update: {},
    create: {
      codigo: 'RF-005',
      descricao: 'Óleo Lubrificante ISO VG 46 (1L)',
      unidade: Unidade.Ll,
      quantidade_estoque: 5,
      quantidade_minima: 1,
      departamento: Complexo.SHOPPING_COLINAS,
      marca: 'Mobil',
      price: 42.0,
      subcategoriaId: subRefrigeracao.id,
    },
  });

  await prisma.material.upsert({
    where: { codigo: 'EL-008' },
    update: {},
    create: {
      codigo: 'EL-008',
      descricao: 'Fusível NH 100A gG',
      unidade: Unidade.Un,
      quantidade_estoque: 20,
      quantidade_minima: 4,
      departamento: Complexo.SHOPPING_COLINAS,
      marca: 'Siemens',
      price: 18.5,
      subcategoriaId: subEletrica2.id,
    },
  });

  await prisma.material.upsert({
    where: { codigo: 'EL-009' },
    update: {},
    create: {
      codigo: 'EL-009',
      descricao: 'Fita Isolante 20m (rolo)',
      unidade: Unidade.Un,
      quantidade_estoque: 30,
      quantidade_minima: 5,
      departamento: Complexo.SHOPPING_COLINAS,
      marca: '3M',
      price: 6.5,
      subcategoriaId: subEletrica.id,
    },
  });

  console.log('✅ 4 Materiais de teste criados (Filtro de Ar, Óleo Lubrificante, Fusível, Fita Isolante)');

  // ─── ChecklistTemplates (idempotente: só cria se não existir) ──────────────

  async function upsertTemplate(nome: string, tipo: string, medicoes: object[], itens: { descricao: string; ordem: number; obrigatorio: boolean }[]) {
    const existing = await prisma.checklistTemplate.findFirst({ where: { nome } });
    if (existing) return existing;
    return prisma.checklistTemplate.create({
      data: {
        nome,
        tipo,
        medicoes,
        itens: { create: itens },
      },
    });
  }

  const tplQE = await upsertTemplate(
    'Inspeção e Conformidade — Quadro Elétrico',
    'QE',
    [
      { titulo: 'Tensão entre Fases (V)', icone: 'zap', campos: [{ placeholder: 'L1-L2' }, { placeholder: 'L2-L3' }, { placeholder: 'L3-L1' }] },
      { titulo: 'Corrente por Fase (A)', icone: 'zap', campos: [{ placeholder: 'Fase R' }, { placeholder: 'Fase S' }, { placeholder: 'Fase T' }] },
    ],
    [
      { descricao: 'Reaperto de todas as conexões (disjuntores e barramentos)?', ordem: 1, obrigatorio: true },
      { descricao: 'Inspeção visual de sinais de aquecimento ou carbonização?', ordem: 2, obrigatorio: true },
      { descricao: 'Limpeza interna do painel com ar comprimido/vácuo?', ordem: 3, obrigatorio: true },
      { descricao: 'Verificação do funcionamento dos ventiladores/exaustores?', ordem: 4, obrigatorio: true },
      { descricao: 'Teste de atuação mecânica dos disjuntores principais?', ordem: 5, obrigatorio: true },
      { descricao: 'Estado das etiquetas de identificação e sinalização de segurança?', ordem: 6, obrigatorio: false },
      { descricao: 'Integridade física das canaletas e chicotes elétricos?', ordem: 7, obrigatorio: true },
      { descricao: 'Verificação do aterramento e continuidade do neutro?', ordem: 8, obrigatorio: true },
      { descricao: 'Inspeção de barramentos — oxidação, folga ou aquecimento?', ordem: 9, obrigatorio: true },
      { descricao: 'Registro de componentes substituídos ou com desgaste identificado?', ordem: 10, obrigatorio: false },
    ],
  );

  const tplBO = await upsertTemplate(
    'Inspeção e Conformidade — Bomba',
    'BO',
    [
      { titulo: 'Pressão de Operação (bar)', icone: 'droplets', campos: [{ placeholder: 'Sucção' }, { placeholder: 'Recalque' }] },
      { titulo: 'Temperatura dos Mancais (°C)', icone: 'droplets', campos: [{ placeholder: 'Mancal Dianteiro' }, { placeholder: 'Mancal Traseiro' }] },
      { titulo: 'Parâmetros Elétricos', icone: 'zap', campos: [{ placeholder: 'Tensão (V)' }, { placeholder: 'Corrente (A)' }] },
    ],
    [
      { descricao: 'Verificação do nível de óleo lubrificante do motor/mancais?', ordem: 1, obrigatorio: true },
      { descricao: 'Inspeção visual de vazamentos (água, óleo, graxa)?', ordem: 2, obrigatorio: true },
      { descricao: 'Verificação de ruídos e vibrações anormais em operação?', ordem: 3, obrigatorio: true },
      { descricao: 'Verificação do estado dos selos mecânicos ou gaxetas?', ordem: 4, obrigatorio: true },
      { descricao: 'Teste de funcionamento em carga (pressão e vazão nominais)?', ordem: 5, obrigatorio: true },
      { descricao: 'Verificação do alinhamento motor-bomba?', ordem: 6, obrigatorio: true },
      { descricao: 'Inspeção das conexões elétricas do motor (bornes, proteções)?', ordem: 7, obrigatorio: true },
      { descricao: 'Verificação das válvulas de sucção e recalque?', ordem: 8, obrigatorio: true },
      { descricao: 'Limpeza geral da unidade e área ao redor?', ordem: 9, obrigatorio: false },
      { descricao: 'Registro de anomalias encontradas e ações tomadas?', ordem: 10, obrigatorio: false },
    ],
  );

  const tplAR = await upsertTemplate(
    'Inspeção e Conformidade — Ar Condicionado',
    'AR',
    [
      { titulo: 'Temperaturas (°C)', icone: 'wind', campos: [{ placeholder: 'Insuflamento' }, { placeholder: 'Retorno' }, { placeholder: 'Ambiente' }] },
      { titulo: 'Parâmetros Elétricos', icone: 'zap', campos: [{ placeholder: 'Tensão (V)' }, { placeholder: 'Corrente Compressor (A)' }, { placeholder: 'Corrente Ventilador (A)' }] },
    ],
    [
      { descricao: 'Limpeza do filtro de ar da unidade evaporadora?', ordem: 1, obrigatorio: true },
      { descricao: 'Limpeza das aletas do condensador?', ordem: 2, obrigatorio: true },
      { descricao: 'Verificação de vazamentos de gás refrigerante (visual + detector)?', ordem: 3, obrigatorio: true },
      { descricao: 'Limpeza e desobstrução da bandeja e dreno de condensado?', ordem: 4, obrigatorio: true },
      { descricao: 'Verificação do estado das correias e rolamentos do ventilador?', ordem: 5, obrigatorio: true },
      { descricao: 'Inspeção das conexões elétricas (bornes, capacitores, relés)?', ordem: 6, obrigatorio: true },
      { descricao: 'Teste de funcionamento nos modos frio, ventilação e calor?', ordem: 7, obrigatorio: true },
      { descricao: 'Verificação do diferencial de temperatura insuflamento × retorno (mín. 8°C)?', ordem: 8, obrigatorio: true },
      { descricao: 'Inspeção do estado da isolação das tubulações frigoríficas?', ordem: 9, obrigatorio: false },
      { descricao: 'Registro de componentes com desgaste e recomendações de troca?', ordem: 10, obrigatorio: false },
    ],
  );

  const tplGE = await upsertTemplate(
    'Inspeção e Conformidade — Gerador',
    'GE',
    [
      { titulo: 'Parâmetros Elétricos', icone: 'zap', campos: [{ placeholder: 'Tensão L1-L2 (V)' }, { placeholder: 'Tensão L2-L3 (V)' }, { placeholder: 'Tensão L3-L1 (V)' }, { placeholder: 'Corrente Média (A)' }] },
      { titulo: 'Motor e Combustível', icone: 'zap', campos: [{ placeholder: 'Frequência (Hz)' }, { placeholder: 'RPM' }, { placeholder: 'Nível Combustível (%)' }] },
      { titulo: 'Temperaturas', icone: 'zap', campos: [{ placeholder: 'Motor (°C)' }, { placeholder: 'Água/Radiador (°C)' }] },
    ],
    [
      { descricao: 'Verificação do nível de óleo lubrificante do motor?', ordem: 1, obrigatorio: true },
      { descricao: 'Verificação do nível do líquido de arrefecimento?', ordem: 2, obrigatorio: true },
      { descricao: 'Inspeção visual de vazamentos de óleo, combustível ou água?', ordem: 3, obrigatorio: true },
      { descricao: 'Verificação do estado e tensão das correias do motor?', ordem: 4, obrigatorio: true },
      { descricao: 'Inspeção das conexões elétricas, bornes e bateria?', ordem: 5, obrigatorio: true },
      { descricao: 'Teste de partida automática e manual do gerador?', ordem: 6, obrigatorio: true },
      { descricao: 'Verificação do funcionamento do carregador de bateria?', ordem: 7, obrigatorio: true },
      { descricao: 'Inspeção do escapamento e sistema de exaustão?', ordem: 8, obrigatorio: false },
      { descricao: 'Teste de operação em carga e transferência pela chave ATS?', ordem: 9, obrigatorio: true },
      { descricao: 'Registro de falhas, alarmes ou componentes com desgaste?', ordem: 10, obrigatorio: false },
    ],
  );

  console.log(`✅ 4 ChecklistTemplates: QE(${tplQE.id.slice(0,8)}) BO(${tplBO.id.slice(0,8)}) AR(${tplAR.id.slice(0,8)}) GE(${tplGE.id.slice(0,8)})`);
  console.log('🎉 Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
