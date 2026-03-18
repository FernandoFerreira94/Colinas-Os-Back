/*
  Warnings:

  - You are about to drop the column `file_equipamento` on the `Equipamentos` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tag_formatada]` on the table `Equipamentos` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `categoria` on the `Categoria_Equipamento` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `tag_formatada` to the `Equipamentos` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `funcao` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `plantao` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "CategoriaEquipamento" AS ENUM ('Eletrica', 'Refrigeracao');

-- CreateEnum
CREATE TYPE "Unidade" AS ENUM ('Un', 'Kg', 'Mt', 'Cx', 'Ll', 'Pc');

-- CreateEnum
CREATE TYPE "Complexo" AS ENUM ('SHOPPING_COLINAS', 'GREEN_TOWER', 'ESTACIONAMENTO');

-- CreateEnum
CREATE TYPE "TipoOS" AS ENUM ('CORRETIVA', 'MELHORIA', 'ACOMPANHAMENTO', 'PREVENTIVA');

-- CreateEnum
CREATE TYPE "StatusOS" AS ENUM ('ABERTA', 'EM_EXECUCAO', 'AGUARDANDO_MATERIAL', 'MATERIAL_COMPRADO', 'MATERIAL_RECUSADO', 'AGUARDANDO_FISCALIZACAO', 'FINALIZADA');

-- CreateEnum
CREATE TYPE "Prioridade" AS ENUM ('BAIXA', 'MEDIA', 'ALTA');

-- CreateEnum
CREATE TYPE "FuncaoUser" AS ENUM ('ELETRICISTA', 'TECNICO_REFRIGERACAO', 'OFICIAL_GERAL', 'LIDER', 'SUPERVISOR', 'ALMOXARIFE', 'COORDENADOR', 'GERENTE_OPERACIONAL');

-- CreateEnum
CREATE TYPE "Plantao" AS ENUM ('Diurno', 'Noturno', 'Comercial1', 'Comercial2');

-- DropIndex
DROP INDEX "Equipamentos_num_tag_key";

-- AlterTable
ALTER TABLE "Categoria_Equipamento" DROP COLUMN "categoria",
ADD COLUMN     "categoria" "CategoriaEquipamento" NOT NULL;

-- AlterTable
ALTER TABLE "Equipamentos" DROP COLUMN "file_equipamento",
ADD COLUMN     "ativo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "empresa_id" TEXT,
ADD COLUMN     "fotos" TEXT[],
ADD COLUMN     "localizacao_id" TEXT,
ADD COLUMN     "tag_formatada" TEXT NOT NULL,
ALTER COLUMN "descricao" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "funcao",
ADD COLUMN     "funcao" "FuncaoUser" NOT NULL,
DROP COLUMN "plantao",
ADD COLUMN     "plantao" "Plantao" NOT NULL;

-- DropEnum
DROP TYPE "Categoria";

-- CreateTable
CREATE TABLE "Localizacao" (
    "id" TEXT NOT NULL,
    "complexo" "Complexo" NOT NULL,
    "andar" TEXT,
    "area" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Localizacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmpresaTerceirizada" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cnpj" TEXT,
    "contato" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmpresaTerceirizada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrdemServico" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "tipo" "TipoOS" NOT NULL,
    "status" "StatusOS" NOT NULL DEFAULT 'ABERTA',
    "prioridade" "Prioridade" NOT NULL DEFAULT 'MEDIA',
    "complexo" "Complexo" NOT NULL,
    "localizacao_id" TEXT,
    "equipamento_id" TEXT,
    "tecnico_id" TEXT,
    "criado_por_id" TEXT NOT NULL,
    "empresa_id" TEXT,
    "preventiva_id" TEXT,
    "fotos" TEXT[],
    "observacao_fiscal" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "finalizada_at" TIMESTAMP(3),

    CONSTRAINT "OrdemServico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OsApoio" (
    "id" TEXT NOT NULL,
    "os_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "OsApoio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Categoria_Material" (
    "id" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,

    CONSTRAINT "Categoria_Material_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubCategoria_Material" (
    "id" TEXT NOT NULL,
    "subCategoria" TEXT NOT NULL,
    "categoria_id" TEXT NOT NULL,

    CONSTRAINT "SubCategoria_Material_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materiais" (
    "id" TEXT NOT NULL,
    "codigo" VARCHAR(20) NOT NULL,
    "descricao" TEXT NOT NULL,
    "cor" TEXT,
    "quantidade_minima" INTEGER,
    "quantidade_estoque" INTEGER NOT NULL DEFAULT 0,
    "departamento" "Complexo" NOT NULL,
    "marca" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "unidade" "Unidade" NOT NULL,
    "subcategoriaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "materiais_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmpresaTerceirizada_cnpj_key" ON "EmpresaTerceirizada"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "OsApoio_os_id_user_id_key" ON "OsApoio"("os_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_Material_categoria_key" ON "Categoria_Material"("categoria");

-- CreateIndex
CREATE UNIQUE INDEX "SubCategoria_Material_subCategoria_categoria_id_key" ON "SubCategoria_Material"("subCategoria", "categoria_id");

-- CreateIndex
CREATE UNIQUE INDEX "materiais_codigo_key" ON "materiais"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Equipamentos_tag_formatada_key" ON "Equipamentos"("tag_formatada");

-- AddForeignKey
ALTER TABLE "Equipamentos" ADD CONSTRAINT "Equipamentos_localizacao_id_fkey" FOREIGN KEY ("localizacao_id") REFERENCES "Localizacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipamentos" ADD CONSTRAINT "Equipamentos_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "EmpresaTerceirizada"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdemServico" ADD CONSTRAINT "OrdemServico_localizacao_id_fkey" FOREIGN KEY ("localizacao_id") REFERENCES "Localizacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdemServico" ADD CONSTRAINT "OrdemServico_equipamento_id_fkey" FOREIGN KEY ("equipamento_id") REFERENCES "Equipamentos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdemServico" ADD CONSTRAINT "OrdemServico_tecnico_id_fkey" FOREIGN KEY ("tecnico_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdemServico" ADD CONSTRAINT "OrdemServico_criado_por_id_fkey" FOREIGN KEY ("criado_por_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdemServico" ADD CONSTRAINT "OrdemServico_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "EmpresaTerceirizada"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OsApoio" ADD CONSTRAINT "OsApoio_os_id_fkey" FOREIGN KEY ("os_id") REFERENCES "OrdemServico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OsApoio" ADD CONSTRAINT "OsApoio_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubCategoria_Material" ADD CONSTRAINT "SubCategoria_Material_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "Categoria_Material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materiais" ADD CONSTRAINT "materiais_subcategoriaId_fkey" FOREIGN KEY ("subcategoriaId") REFERENCES "SubCategoria_Material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
