"use client";

import { useState } from "react";
import {
  Accordion,
  Badge,
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  HStack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { IconChevronDown, IconUserCircle, IconMail } from "@tabler/icons-react";
import { useOnboardingResponses } from "@/features/admin-surveys/api/admin-surveys.queries";
import { ONBOARDING_QUESTIONS } from "@/features/surveys/config/onboarding.questions";

const LIMIT = 20;

function questionLabel(id: string): string {
  const q = ONBOARDING_QUESTIONS.find((q) => q.id === id);
  return q?.question ?? id;
}

function answerValue(answer: string | string[]): string {
  if (Array.isArray(answer)) return answer.join(", ");
  return answer;
}

export function SurveyResponsesViewer() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useOnboardingResponses(page, LIMIT);
  const totalPages = data ? Math.ceil(data.total / LIMIT) : 0;

  if (isLoading) {
    return (
      <VStack align="stretch" gap={4} w="full">
        {Array.from({ length: 4 }).map((_, i) => (
          <Flex
            key={i}
            h="16"
            bg="gray.100"
            borderRadius="md"
            className="skeleton-pulse"
          />
        ))}
        <style>{`
          @keyframes skeletonPulse {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 0.8; }
          }
          .skeleton-pulse {
            animation: skeletonPulse 1.5s ease-in-out infinite;
          }
        `}</style>
      </VStack>
    );
  }

  if (isError) {
    return (
      <Flex
        bg="red.50"
        border="1px"
        borderColor="red.200"
        borderRadius="md"
        p={4}
        gap={3}
        align="center"
      >
        <Box w="3" h="3" borderRadius="full" bg="red.400" flexShrink={0} />
        <Text color="red.700" fontSize="sm">
          No se pudieron cargar las encuestas. Verifica que tengas permisos de
          administrador.
        </Text>
      </Flex>
    );
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
            {data.data.map((row) => {
              const hasAnswers = row.answers.length > 0;
              const dateStr = row.created_at
                ? new Date(row.created_at).toLocaleDateString("es-CO", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : null;

              return (
                <Accordion.Item
                  key={row.userId}
                  value={row.userId}
                  borderBottomWidth={1}
                  borderColor="gray.200"
                  py={2}
                >
                  <Accordion.ItemTrigger cursor="pointer" py={3}>
                    <HStack gap={4} flex={1}>
                      <IconUserCircle size={22} color="gray" />

                      <VStack align="start" gap={0} flex={1}>
                        <Text fontWeight="semibold" color="gray.100">
                          {row.name ?? "—"}
                        </Text>

                        <HStack gap={1} color="gray.300" fontSize="sm">
                          <IconMail size={14} />
                          <Text>{row.email ?? "—"}</Text>
                        </HStack>

                        {dateStr ? (
                          <Text
                            fontSize="sm"
                            color="gray.400"
                            whiteSpace="nowrap"
                          >
                            {dateStr}
                          </Text>
                        ) : (
                          <Badge colorPalette="yellow" size="sm">
                            Sin encuesta
                          </Badge>
                        )}
                      </VStack>

                      <Accordion.ItemIndicator>
                        <IconChevronDown size={18} />
                      </Accordion.ItemIndicator>
                    </HStack>
                  </Accordion.ItemTrigger>

                  <Accordion.ItemContent>
                    <Accordion.ItemBody>
                      {!hasAnswers ? (
                        <Text color="gray.400" fontStyle="italic" fontSize="sm">
                          Este usuario no respondió la encuesta.
                        </Text>
                      ) : (
                        <Grid
                          templateColumns="repeat(auto-fill, minmax(280px, 1fr))"
                          gap={4}
                          px={1}
                        >
                          {row.answers.map((a) => (
                            <Flex
                              key={a.question_id}
                              direction="column"
                              border="1px solid"
                              borderColor="gray.500"
                              borderRadius="md"
                              p={3}
                              gap={1}
                            >
                              <Text
                                fontSize="xs"
                                fontWeight="medium"
                                textTransform="uppercase"
                                letterSpacing="wide"
                              >
                                {questionLabel(a.question_id)}
                              </Text>

                              <Text fontSize="md">{answerValue(a.answer)}</Text>
                            </Flex>
                          ))}
                        </Grid>
                      )}
                    </Accordion.ItemBody>
                  </Accordion.ItemContent>
                </Accordion.Item>
              );
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
