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
  console.log('🎉 Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
