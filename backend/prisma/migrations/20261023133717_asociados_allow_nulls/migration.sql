-- AlterTable
ALTER TABLE "asociados_list" ALTER COLUMN "nombre" DROP NOT NULL,
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "fecha_de_finalizacion" DROP NOT NULL,
ALTER COLUMN "telefono_celular" DROP NOT NULL;
