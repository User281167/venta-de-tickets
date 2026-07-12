"use client";

import {
  Box,
  Button,
  Flex,
  Heading,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useExcelParser } from "../hooks/useExcelParser";
import { useBatchCreateUsers } from "../api/admin-users.queries";
import { FileUploadZone } from "./FileUploadZone";
import { UploadPreviewTable } from "./UploadPreviewTable";
import { BatchResultSummary } from "./BatchResultSummary";
import { toast } from "sonner";
import type { CreateUserInput } from "../api/admin-users.queries";

export function BatchUploadPage() {
  const {
    rows,
    errors,
    totalRows,
    validCount,
    invalidCount,
    isParsing,
    parseError,
    parseFile,
    reset: resetParser,
  } = useExcelParser();
  const batchMutation = useBatchCreateUsers();
  const hasData = rows.length > 0;

  const showResult = !batchMutation.isIdle && batchMutation.data;
  const showConflict =
    batchMutation.isError &&
    !!(
      batchMutation.error as {
        data?: { emails?: string[]; cedulas?: string[] };
      }
    )?.data;
  const showError = batchMutation.isError && !showConflict;

  function handleFileSelect(file: File | null) {
    parseFile(file);
  }

  function handleDownloadTemplate() {
    const link = document.createElement("a");
    link.href = "/load_users_template.xlsx";
    link.download = "load_users_template.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function handleConfirm() {
    if (validCount === 0) return;

    const payload: CreateUserInput[] = rows.map((row) => {
      const item: CreateUserInput = {
        email: row.email,
        password: row.password,
        fullName: row.fullName,
      };

      if (row.cedula) item.cedula = row.cedula;
      if (row.phone) item.phone = row.phone;
      return item;
    });

    try {
      await batchMutation.mutateAsync(payload);
      toast.success(`${validCount} usuarios creados exitosamente`);
    } catch (err: unknown) {
      const apiError = err as {
        data?: { emails?: string[]; cedulas?: string[] };
        message?: string;
      };

      if (apiError?.data?.emails || apiError?.data?.cedulas) {
        return;
      }

      toast.error(apiError?.message ?? "Error al enviar el lote");
    }
  }

  function handleReset() {
    resetParser();
    batchMutation.reset();
  }

  return (
    <VStack gap={6} align="stretch" w="full">
      <Heading size="lg">Carga masiva de usuarios</Heading>

      {showResult && batchMutation.data ? (
        <BatchResultSummary
          result={{
            status: "success",
            createdCount: batchMutation.data.length,
          }}
          onReset={handleReset}
        />
      ) : showConflict ? (
        <BatchResultSummary
          result={{
            status: "conflict" as const,
            conflicts: (
              batchMutation.error as unknown as {
                data: { emails?: string[]; cedulas?: string[] };
              }
            ).data as { emails: string[]; cedulas: string[] },
          }}
          onReset={handleReset}
        />
      ) : showError ? (
        <BatchResultSummary
          result={{
            status: "error" as const,
            errorMessage:
              (batchMutation.error as { message?: string }).message ??
              "Error de red. Intenta de nuevo.",
          }}
          onReset={handleReset}
        />
      ) : (
        <>
          {hasData ? (
            <>
              <UploadPreviewTable
                rows={rows}
                errors={errors}
                totalRows={totalRows}
                validCount={validCount}
                invalidCount={invalidCount}
              />

              <Flex justify="flex-end" gap={3}>
                <Button
                  variant="outline"
                  bg="white"
                  onClick={handleReset}
                  disabled={batchMutation.isPending}
                >
                  Cancelar
                </Button>

                <Button
                  colorPalette="teal"
                  onClick={handleConfirm}
                  disabled={validCount === 0 || batchMutation.isPending}
                  loading={batchMutation.isPending}
                >
                  Confirmar envío ({validCount} usuario
                  {validCount !== 1 ? "s" : ""})
                </Button>
              </Flex>
            </>
          ) : (
            <FileUploadZone
              onFileSelect={handleFileSelect}
              onDownloadTemplate={handleDownloadTemplate}
              disabled={isParsing || batchMutation.isPending}
            />
          )}

          {isParsing && (
            <Flex align="center" gap={3} justify="center" py={8}>
              <Spinner color="teal.500" />
              <Text color="gray.600">Leyendo archivo...</Text>
            </Flex>
          )}

          {parseError && (
            <Box
              p={4}
              bg="red.50"
              borderRadius="md"
              borderWidth={1}
              borderColor="red.200"
            >
              <Text color="red.700">{parseError}</Text>
            </Box>
          )}
        </>
      )}
    </VStack>
  );
}
