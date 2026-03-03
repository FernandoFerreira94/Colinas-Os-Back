-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "nameFull" TEXT NOT NULL,
    "matricula" INTEGER NOT NULL,
    "cpf" TEXT NOT NULL,
    "funcao" TEXT NOT NULL,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "is_almoxarife" BOOLEAN NOT NULL DEFAULT false,
    "plantao" TEXT NOT NULL,
    "equipe" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "date_register" TIMESTAMP(3) NOT NULL,
    "date_termination" TIMESTAMP(3),
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_matricula_key" ON "User"("matricula");

-- CreateIndex
CREATE UNIQUE INDEX "User_cpf_key" ON "User"("cpf");
