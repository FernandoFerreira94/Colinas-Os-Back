-- CreateEnum
CREATE TYPE "StatusSolicitacao" AS ENUM ('PENDENTE', 'APROVADA', 'RECUSADA');

-- CreateEnum
CREATE TYPE "TipoItemSolicitacao" AS ENUM ('CADASTRADO', 'NAO_CADASTRADO');

-- CreateEnum
CREATE TYPE "TipoMovimentacao" AS ENUM ('ENTRADA', 'SAIDA', 'AJUSTE');

-- CreateEnum
CREATE TYPE "StatusPreventiva" AS ENUM ('AGENDADA', 'EM_EXECUCAO', 'FINALIZADA', 'ATRASADA');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "StatusOS" ADD VALUE 'PAUSADA';
ALTER TYPE "StatusOS" ADD VALUE 'RECUSADO';

-- CreateTable
CREATE TABLE "OsHistorico" (
    "id" TEXT NOT NULL,
    "os_id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "status_gerado" "StatusOS" NOT NULL,
    "recusado" BOOLEAN NOT NULL DEFAULT false,
    "criado_por_id" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OsHistorico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SolicitacaoCompra" (
    "id" TEXT NOT NULL,
    "os_id" TEXT,
    "preventiva_id" TEXT,
    "criado_por_id" TEXT NOT NULL,
    "observacao" TEXT,
    "status" "StatusSolicitacao" NOT NULL DEFAULT 'PENDENTE',
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SolicitacaoCompra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SolicitacaoCompraItem" (
    "id" TEXT NOT NULL,
    "solicitacao_id" TEXT NOT NULL,
    "tipo" "TipoItemSolicitacao" NOT NULL,
    "material_id" TEXT,
    "nome" TEXT,
    "descricao" TEXT,
    "unidade" TEXT,
    "imagem_url" TEXT,
    "quantidade" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "SolicitacaoCompraItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaterialGasto" (
    "id" TEXT NOT NULL,
    "os_id" TEXT NOT NULL,
    "material_id" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "registrado_por_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MaterialGasto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovimentacaoEstoque" (
    "id" TEXT NOT NULL,
    "material_id" TEXT NOT NULL,
    "tipo" "TipoMovimentacao" NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "os_id" TEXT,
    "usuario_id" TEXT NOT NULL,
    "descricao" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MovimentacaoEstoque_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChecklistTemplate" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChecklistTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChecklistItem" (
    "id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,
    "obrigatorio" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ChecklistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Preventiva" (
    "id" TEXT NOT NULL,
    "equipamento_id" TEXT NOT NULL,
    "checklist_id" TEXT NOT NULL,
    "frequencia_dias" INTEGER NOT NULL,
    "status" "StatusPreventiva" NOT NULL DEFAULT 'AGENDADA',
    "data_agendada" TIMESTAMP(3) NOT NULL,
    "data_finalizada" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Preventiva_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OsHistorico" ADD CONSTRAINT "OsHistorico_os_id_fkey" FOREIGN KEY ("os_id") REFERENCES "OrdemServico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OsHistorico" ADD CONSTRAINT "OsHistorico_criado_por_id_fkey" FOREIGN KEY ("criado_por_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitacaoCompra" ADD CONSTRAINT "SolicitacaoCompra_os_id_fkey" FOREIGN KEY ("os_id") REFERENCES "OrdemServico"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitacaoCompra" ADD CONSTRAINT "SolicitacaoCompra_criado_por_id_fkey" FOREIGN KEY ("criado_por_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitacaoCompraItem" ADD CONSTRAINT "SolicitacaoCompraItem_solicitacao_id_fkey" FOREIGN KEY ("solicitacao_id") REFERENCES "SolicitacaoCompra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitacaoCompraItem" ADD CONSTRAINT "SolicitacaoCompraItem_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materiais"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialGasto" ADD CONSTRAINT "MaterialGasto_os_id_fkey" FOREIGN KEY ("os_id") REFERENCES "OrdemServico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialGasto" ADD CONSTRAINT "MaterialGasto_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materiais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialGasto" ADD CONSTRAINT "MaterialGasto_registrado_por_id_fkey" FOREIGN KEY ("registrado_por_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimentacaoEstoque" ADD CONSTRAINT "MovimentacaoEstoque_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materiais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimentacaoEstoque" ADD CONSTRAINT "MovimentacaoEstoque_os_id_fkey" FOREIGN KEY ("os_id") REFERENCES "OrdemServico"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimentacaoEstoque" ADD CONSTRAINT "MovimentacaoEstoque_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistItem" ADD CONSTRAINT "ChecklistItem_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "ChecklistTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Preventiva" ADD CONSTRAINT "Preventiva_equipamento_id_fkey" FOREIGN KEY ("equipamento_id") REFERENCES "Equipamentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Preventiva" ADD CONSTRAINT "Preventiva_checklist_id_fkey" FOREIGN KEY ("checklist_id") REFERENCES "ChecklistTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
