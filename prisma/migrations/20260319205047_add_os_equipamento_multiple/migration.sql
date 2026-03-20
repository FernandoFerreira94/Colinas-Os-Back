-- CreateTable
CREATE TABLE "OsEquipamento" (
    "id" TEXT NOT NULL,
    "os_id" TEXT NOT NULL,
    "equipamento_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OsEquipamento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OsEquipamento_os_id_equipamento_id_key" ON "OsEquipamento"("os_id", "equipamento_id");

-- AddForeignKey
ALTER TABLE "OsEquipamento" ADD CONSTRAINT "OsEquipamento_os_id_fkey" FOREIGN KEY ("os_id") REFERENCES "OrdemServico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OsEquipamento" ADD CONSTRAINT "OsEquipamento_equipamento_id_fkey" FOREIGN KEY ("equipamento_id") REFERENCES "Equipamentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
