-- CreateEnum
CREATE TYPE "NivelEstresse" AS ENUM ('Baixo', 'Medio', 'Alto');

-- CreateEnum
CREATE TYPE "DesempenhoAcademico" AS ENUM ('Melhorou', 'Mesmo', 'Piorou');

-- CreateEnum
CREATE TYPE "NivelRisco" AS ENUM ('Baixo', 'Moderado', 'Alto');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Humor" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "descricao" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Humor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistroBemEstar" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nivelHumor" INTEGER NOT NULL,
    "nota" TEXT,
    "tempoTela" DOUBLE PRECISION NOT NULL,
    "duracaoSono" DOUBLE PRECISION NOT NULL,
    "atividadeFisica" DOUBLE PRECISION NOT NULL,
    "nivelEstresse" "NivelEstresse" NOT NULL,
    "ansiedadeAntesProva" BOOLEAN NOT NULL,
    "desempenhoAcademico" "DesempenhoAcademico" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegistroBemEstar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DefinicaoCluster" (
    "id" SERIAL NOT NULL,
    "clusterLabel" INTEGER NOT NULL,
    "nomePerfil" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "dadosCentroide" JSONB NOT NULL,
    "caracteristicas" JSONB NOT NULL,
    "quantidadeAlunos" INTEGER NOT NULL DEFAULT 0,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DefinicaoCluster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerfilComportamental" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "clusterId" INTEGER NOT NULL,
    "nivelRisco" "NivelRisco" NOT NULL,
    "insights" JSONB NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PerfilComportamental_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SequenciaHumor" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sequenciaAtual" INTEGER NOT NULL DEFAULT 0,
    "maiorSequencia" INTEGER NOT NULL DEFAULT 0,
    "ultimaData" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SequenciaHumor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "RegistroBemEstar_userId_createdAt_idx" ON "RegistroBemEstar"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "DefinicaoCluster_clusterLabel_key" ON "DefinicaoCluster"("clusterLabel");

-- CreateIndex
CREATE UNIQUE INDEX "PerfilComportamental_userId_key" ON "PerfilComportamental"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SequenciaHumor_userId_key" ON "SequenciaHumor"("userId");

-- AddForeignKey
ALTER TABLE "Humor" ADD CONSTRAINT "Humor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroBemEstar" ADD CONSTRAINT "RegistroBemEstar_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerfilComportamental" ADD CONSTRAINT "PerfilComportamental_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerfilComportamental" ADD CONSTRAINT "PerfilComportamental_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "DefinicaoCluster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SequenciaHumor" ADD CONSTRAINT "SequenciaHumor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

