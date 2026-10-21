-- CreateTable
CREATE TABLE "register" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "cedula" VARCHAR(20) NOT NULL,
    "full_name" VARCHAR(150) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "profesion" VARCHAR(100) NOT NULL,
    "is_egresado" BOOLEAN NOT NULL DEFAULT false,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "register_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "register_cedula_key" ON "register"("cedula");
