"use client";

import { useState } from "react";
import {
  Accordion,
  Button,
  Heading,
  HStack,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  SurveyRow,
  useOnboardingResponses,
} from "@/features/admin-surveys/api/admin-surveys.queries";
import { SurveyResponsesLoading } from "./SurveyResponsesLoading";
import { SurveyResponsesError } from "./SurveyResponsesError";
import { SurveyResponsesItem } from "./SurveyResponsesItem";

const LIMIT = 20;

export function SurveyResponsesViewer() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useOnboardingResponses(page, LIMIT);
  const totalPages = data ? Math.ceil(data.total / LIMIT) : 0;

  if (isLoading) {
    return <SurveyResponsesLoading />;
  }

  if (isError) {
    return <SurveyResponsesError />;
  }

  return (
    <VStack align="stretch" gap={4} w="full">
      <Heading as="h1" size="lg">
        Encuestas de incorporación
      </Heading>

      {!data || data.data.length === 0 ? (
        <Text color="gray.500">No hay usuarios registrados todavía.</Text>
      ) : (
        <>
          <Accordion.Root defaultValue={[]} collapsible>
            {data.data.map((row: SurveyRow) => {
              return <SurveyResponsesItem key={row.userId} data={row} />;
            })}
          </Accordion.Root>

          <HStack justify="space-between">
            <Text fontSize="sm" color="gray.500">
              {data.total} usuario(s) — Página {page} de {totalPages}
            </Text>

            <HStack gap={2}>
              <Button
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Anterior
              </Button>

              <Button
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Siguiente
              </Button>
            </HStack>
          </HStack>
        </>
      )}
    </VStack>
  );
}
