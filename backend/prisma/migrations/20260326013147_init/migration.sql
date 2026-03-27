/*
  Warnings:

  - The primary key for the `Humor` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `nivel` on the `Humor` table. All the data in the column will be lost.
  - You are about to drop the column `usuarioId` on the `Humor` table. All the data in the column will be lost.
  - You are about to drop the `Usuario` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `tipo` to the `Humor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Humor` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Humor" DROP CONSTRAINT "Humor_usuarioId_fkey";

-- AlterTable
ALTER TABLE "Humor" DROP CONSTRAINT "Humor_pkey",
DROP COLUMN "nivel",
DROP COLUMN "usuarioId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "descricao" TEXT,
ADD COLUMN     "tipo" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Humor_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Humor_id_seq";

-- DropTable
DROP TABLE "Usuario";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Humor" ADD CONSTRAINT "Humor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
