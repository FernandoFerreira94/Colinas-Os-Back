-- CreateEnum
CREATE TYPE "Categoria" AS ENUM ('Eletrica', 'Refrigeraca');

-- CreateTable
CREATE TABLE "Categoria_Equipamento" (
    "id" TEXT NOT NULL,
    "categoria" "Categoria" NOT NULL,
    "tag" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Categoria_Equipamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Equipamentos" (
    "id" TEXT NOT NULL,
    "num_tag" INTEGER NOT NULL,
    "name_equipamento" TEXT NOT NULL,
    "categoria_id" TEXT NOT NULL,
    "modelo" TEXT,
    "fabricante" TEXT,
    "local_instalacao" TEXT,
    "descricao" TEXT NOT NULL,
    "file_equipamento" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Equipamentos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_Equipamento_tag_key" ON "Categoria_Equipamento"("tag");

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_Equipamento_tipo_key" ON "Categoria_Equipamento"("tipo");

-- CreateIndex
CREATE UNIQUE INDEX "Equipamentos_num_tag_key" ON "Equipamentos"("num_tag");

-- AddForeignKey
ALTER TABLE "Equipamentos" ADD CONSTRAINT "Equipamentos_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "Categoria_Equipamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
