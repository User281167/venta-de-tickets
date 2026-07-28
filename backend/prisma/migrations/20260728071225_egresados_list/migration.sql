-- CreateTable
CREATE TABLE "egresados_list" (
    "cedula" VARCHAR(20) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "egresados_list_cedula_key" ON "egresados_list"("cedula");
