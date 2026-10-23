-- AlterTable
ALTER TABLE "register" ADD COLUMN     "is_asociado" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "asociados_list" (
    "cedula" VARCHAR(20) NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "fecha_de_finalizacion" DATE NOT NULL,
    "telefono_celular" VARCHAR(20) NOT NULL,

    CONSTRAINT "asociados_list_pkey" PRIMARY KEY ("cedula")
);
