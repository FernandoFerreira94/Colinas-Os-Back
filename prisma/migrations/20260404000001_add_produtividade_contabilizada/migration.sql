-- AlterTable: adiciona campo produtividade_contabilizada em OrdemServico
-- Controla se a produtividade (os_finalizadas / os_apoio) já foi contabilizada
-- para evitar duplicidade em re-finalizações

ALTER TABLE "OrdemServico" ADD COLUMN IF NOT EXISTS "produtividade_contabilizada" BOOLEAN NOT NULL DEFAULT false;
