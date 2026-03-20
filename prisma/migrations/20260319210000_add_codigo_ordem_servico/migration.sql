-- Adiciona coluna codigo com valor temporário para linhas existentes
ALTER TABLE "OrdemServico" ADD COLUMN "codigo" TEXT;

-- Preenche os registros existentes com um código único usando CTE (window function não é permitida em UPDATE direto)
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY "created_at") AS rn
  FROM "OrdemServico"
  WHERE "codigo" IS NULL
)
UPDATE "OrdemServico" os
SET "codigo" = 'OS-' || LPAD(CAST(ranked.rn AS TEXT), 4, '0')
FROM ranked
WHERE os.id = ranked.id;

-- Torna a coluna NOT NULL e UNIQUE
ALTER TABLE "OrdemServico" ALTER COLUMN "codigo" SET NOT NULL;
ALTER TABLE "OrdemServico" ADD CONSTRAINT "OrdemServico_codigo_key" UNIQUE ("codigo");
