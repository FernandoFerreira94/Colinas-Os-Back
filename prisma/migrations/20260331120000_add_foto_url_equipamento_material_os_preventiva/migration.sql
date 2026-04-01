-- CreateEnum
CREATE TYPE "ContextoFoto" AS ENUM ('ABERTURA', 'EXECUCAO', 'FISCALIZACAO', 'FINALIZANDO', 'AGUARDANDO_MATERIAL');

-- AlterTable
ALTER TABLE "Equipamentos" ADD COLUMN     "foto_url" TEXT;

-- AlterTable
ALTER TABLE "OrdemServico" DROP COLUMN "fotos";

-- AlterTable
ALTER TABLE "materiais" ADD COLUMN     "foto_url" TEXT;

-- CreateTable
CREATE TABLE "os_fotos" (
    "id" TEXT NOT NULL,
    "os_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "contexto" "ContextoFoto" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "os_fotos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "preventiva_fotos" (
    "id" TEXT NOT NULL,
    "preventiva_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "preventiva_fotos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "os_fotos" ADD CONSTRAINT "os_fotos_os_id_fkey" FOREIGN KEY ("os_id") REFERENCES "OrdemServico"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preventiva_fotos" ADD CONSTRAINT "preventiva_fotos_preventiva_id_fkey" FOREIGN KEY ("preventiva_id") REFERENCES "Preventiva"("id") ON DELETE CASCADE ON UPDATE CASCADE;
