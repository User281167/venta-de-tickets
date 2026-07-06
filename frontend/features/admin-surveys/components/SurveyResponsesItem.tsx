"use client";

import {
  Accordion,
  Badge,
  Flex,
  Grid,
  HStack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { IconChevronDown, IconUserCircle, IconMail } from "@tabler/icons-react";
import { ONBOARDING_QUESTIONS } from "@/features/surveys/config/onboarding.questions";
import { SurveyRow } from "@/features/admin-surveys/api/admin-surveys.queries";

import React from "react";

function questionLabel(id: string): string {
  const q = ONBOARDING_QUESTIONS.find((q) => q.id === id);
  return q?.question ?? id;
}

function answerValue(answer: string | string[]): string {
  if (Array.isArray(answer)) return answer.join(", ");
  return answer;
}

interface Props {
  data: SurveyRow;
}

export const SurveyResponsesItem = React.memo(function SurveyResponsesItem({
  data,
}: Props) {
  const hasAnswers = data.answers.length > 0;
  const dateStr = data.created_at
    ? new Date(data.created_at).toLocaleDateString("es-CO", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <Accordion.Item
      key={data.userId}
      value={data.userId}
      borderBottomWidth={1}
      borderColor="gray.200"
      py={2}
    >
      <Accordion.ItemTrigger cursor="pointer" py={3}>
        <HStack gap={4} flex={1}>
          <IconUserCircle size={22} color="gray" />

          <VStack align="start" gap={0} flex={1}>
            <Text fontWeight="semibold" color="gray.100">
              {data.name ?? "—"}
            </Text>

            <HStack gap={1} color="gray.300" fontSize="sm">
              <IconMail size={14} />
              <Text>{data.email ?? "—"}</Text>
            </HStack>

            {dateStr ? (
              <Text fontSize="sm" color="gray.400" whiteSpace="nowrap">
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
              {data.answers.map((a) => (
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
});
