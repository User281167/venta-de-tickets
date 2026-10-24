/*
  Warnings:

  - The primary key for the `asociados_list` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "asociados_list" DROP CONSTRAINT "asociados_list_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "asociados_list_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE INDEX "asociados_list_cedula_fecha_de_finalizacion_idx" ON "asociados_list"("cedula", "fecha_de_finalizacion");
