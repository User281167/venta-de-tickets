"use client";

import {
  Box,
  Button,
  Flex,
  HStack,
  Heading,
  Spinner,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { IconUpload, IconRotate } from "@tabler/icons-react";
import { motion, useReducedMotion } from "framer-motion";
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
  const reduced = useReducedMotion();

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
    <VStack gap={8} align="stretch" w="full" minW={0}>
      <motion.div
        initial={reduced ? {} : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Stack gap={1}>
          <Text
            color="brand.cyan"
            fontSize="sm"
            fontWeight="black"
            textTransform="uppercase"
            letterSpacing="0.15em"
          >
            Gestión de usuarios
          </Text>
          <Heading as="h1" size="2xl" color="white" lineHeight="1.1">
            Carga masiva
          </Heading>
          <Text color="brand.muted" maxW="600px">
            Sube un archivo Excel con los usuarios a crear. Descarga la
            plantilla para asegurar el formato correcto.
          </Text>
        </Stack>
      </motion.div>

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
              <Box
                className="glass-card"
                borderRadius="2xl"
                p={{ base: 4, md: 6 }}
              >
                <UploadPreviewTable
                  rows={rows}
                  errors={errors}
                  totalRows={totalRows}
                  validCount={validCount}
                  invalidCount={invalidCount}
                />
              </Box>

              <HStack justify="flex-end" gap={3} flexWrap="wrap">
                <Button
                  variant="outline"
                  color="white"
                  borderColor="rgba(255,255,255,0.16)"
                  borderRadius="xl"
                  onClick={handleReset}
                  disabled={batchMutation.isPending}
                  _hover={{ bg: "rgba(255,255,255,0.06)" }}
                >
                  <HStack gap={2}>
                    <IconRotate size={18} />
                    <Text>Cancelar</Text>
                  </HStack>
                </Button>

                <Button
                  bg="brand.violet"
                  color="white"
                  fontWeight="bold"
                  borderRadius="xl"
                  onClick={handleConfirm}
                  disabled={validCount === 0 || batchMutation.isPending}
                  loading={batchMutation.isPending}
                  _hover={{ bg: "#6a2be2", transform: "translateY(-2px)" }}
                  transition="all 0.2s ease"
                >
                  <HStack gap={2}>
                    <IconUpload size={18} />
                    <Text>
                      Confirmar envío ({validCount} usuario
                      {validCount !== 1 ? "s" : ""})
                    </Text>
                  </HStack>
                </Button>
              </HStack>
            </>
          ) : (
            <FileUploadZone
              onFileSelect={handleFileSelect}
              onDownloadTemplate={handleDownloadTemplate}
              disabled={isParsing || batchMutation.isPending}
            />
          )}

          {isParsing && (
            <Flex
              align="center"
              gap={3}
              justify="center"
              py={10}
              className="glass-card"
              borderRadius="2xl"
            >
              <Spinner color="brand.cyan" size="xl" />
              <Text color="brand.muted">Leyendo archivo...</Text>
            </Flex>
          )}

          {parseError && (
            <Box
              p={4}
              borderRadius="xl"
              bg="rgba(239,68,68,0.1)"
              border="1px solid rgba(239,68,68,0.3)"
            >
              <Text color="#ef4444" fontWeight="medium">
                {parseError}
              </Text>
            </Box>
          )}
        </>
      )}
    </VStack>
  );
}
