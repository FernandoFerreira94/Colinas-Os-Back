-- AlterTable
ALTER TABLE "OrdemServico" ADD COLUMN     "atribuido_por_id" TEXT;

-- AddForeignKey
ALTER TABLE "OrdemServico" ADD CONSTRAINT "OrdemServico_atribuido_por_id_fkey" FOREIGN KEY ("atribuido_por_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
