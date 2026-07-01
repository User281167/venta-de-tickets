"use client";

import {
  Box,
  Flex,
  HStack,
  Input,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { IconCheck } from "@tabler/icons-react";
import type { OnboardingQuestion } from "../config/onboarding.questions";

type SurveyQuestionProps = {
  question: OnboardingQuestion;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  customText?: string;
  onCustomTextChange?: (text: string) => void;
};

function SingleOption({
  option,
  isSelected,
  onSelect,
}: {
  option: string;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <Box
      as="button"
      onClick={onSelect}
      p={3.5}
      borderWidth={1}
      borderColor={isSelected ? "#76ABAE" : "gray.200"}
      bg={isSelected ? "#F0F7F7" : "white"}
      borderRadius="lg"
      transition="all 0.15s"
      _hover={{
        borderColor: isSelected ? "#76ABAE" : "gray.300",
        bg: isSelected ? "#F0F7F7" : "gray.50",
      }}
      w="full"
      textAlign="left"
      cursor="pointer"
    >
      <HStack gap={3}>
        <Flex
          w={4.5}
          h={4.5}
          borderWidth={2}
          borderColor={isSelected ? "#76ABAE" : "gray.300"}
          borderRadius="full"
          align="center"
          justify="center"
          flexShrink={0}
          transition="all 0.15s"
        >
          {isSelected ? (
            <Box w={2.5} h={2.5} bg="#76ABAE" borderRadius="full" />
          ) : null}
        </Flex>

        <Text
          fontSize="sm"
          fontWeight={isSelected ? "semibold" : "normal"}
          color={isSelected ? "#303841" : "gray.600"}
        >
          {option}
        </Text>
      </HStack>
    </Box>
  );
}

function MultiOption({
  option,
  isSelected,
  onToggle,
}: {
  option: string;
  isSelected: boolean;
  onToggle: () => void;
}) {
  return (
    <Box
      as="button"
      onClick={onToggle}
      p={3.5}
      borderWidth={1}
      borderColor={isSelected ? "#76ABAE" : "gray.200"}
      bg={isSelected ? "#F0F7F7" : "white"}
      borderRadius="lg"
      transition="all 0.15s"
      _hover={{
        borderColor: isSelected ? "#76ABAE" : "gray.300",
        bg: isSelected ? "#F0F7F7" : "gray.50",
      }}
      w="full"
      textAlign="left"
      cursor="pointer"
    >
      <HStack gap={3}>
        <Flex
          w={4.5}
          h={4.5}
          borderWidth={2}
          borderColor={isSelected ? "#76ABAE" : "gray.300"}
          borderRadius="sm"
          bg={isSelected ? "#76ABAE" : "transparent"}
          align="center"
          justify="center"
          flexShrink={0}
          transition="all 0.15s"
        >
          {isSelected ? <IconCheck size={11} color="white" /> : null}
        </Flex>

        <Text
          fontSize="sm"
          fontWeight={isSelected ? "semibold" : "normal"}
          color={isSelected ? "#303841" : "gray.600"}
        >
          {option}
        </Text>
      </HStack>
    </Box>
  );
}

function SelectedChips({
  values,
  onRemove,
}: {
  values: string[];
  onRemove: (value: string) => void;
}) {
  if (values.length === 0) return null;

  return (
    <Flex gap={1.5} flexWrap="wrap">
      {values.map((v) => (
        <Flex
          key={v}
          bg="#E8F3F3"
          color="#76ABAE"
          px={2.5}
          py={0.5}
          borderRadius="full"
          fontSize="xs"
          fontWeight="medium"
          align="center"
          gap={1}
        >
          <Text>{v}</Text>

          <Box
            as="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(v);
            }}
            ml={0.5}
            color="gray.400"
            _hover={{ color: "gray.600" }}
            lineHeight="1"
            aria-label={`Quitar ${v}`}
          >
            ×
          </Box>
        </Flex>
      ))}
    </Flex>
  );
}

export function SurveyQuestion({
  question,
  value,
  onChange,
  customText = "",
  onCustomTextChange,
}: SurveyQuestionProps) {
  const multiValues = question.type === "multi" ? (value as string[]) : [];
  const isOtherSelected = question.type === "single" && value === "Otro";
  const hasOtherInMulti =
    question.type === "multi" && multiValues.includes("Otro");

  return (
    <VStack gap={3} align="stretch">
      {!question.required ? (
        <HStack gap={2} align="center">
          <Text
            fontSize="xs"
            fontWeight="semibold"
            color="gray.400"
            px={2}
            py={0.5}
            borderWidth={1}
            borderColor="gray.200"
            borderRadius="full"
            textTransform="uppercase"
            letterSpacing="wide"
          >
            Opcional
          </Text>

          {question.type === "multi" && multiValues.length > 0 ? (
            <Text fontSize="sm" color="#76ABAE" fontWeight="medium">
              {multiValues.length} seleccionado
              {multiValues.length !== 1 ? "s" : ""}
            </Text>
          ) : null}
        </HStack>
      ) : null}

      {question.type === "single" ? (
        <Stack gap={1.5}>
          {question.options.map((option) => (
            <SingleOption
              key={option}
              option={option}
              isSelected={value === option}
              onSelect={() => {
                onChange(option);
                if (option !== "Otro") {
                  onCustomTextChange?.("");
                }
              }}
            />
          ))}
          {isOtherSelected ? (
            <Input
              value={customText}
              onChange={(e) => onCustomTextChange?.(e.target.value)}
              placeholder="Especifica..."
              size="md"
              borderRadius="lg"
              borderColor="#76ABAE"
              bg="white"
              color="#303841"
              _placeholder={{ color: "gray.400" }}
              _focus={{
                borderColor: "#76ABAE",
                boxShadow: "0 0 0 1px #76ABAE",
              }}
              mt={1}
            />
          ) : null}
        </Stack>
      ) : null}

      {question.type === "multi" ? (
        <VStack gap={2} align="stretch">
          {multiValues.length > 0 ? (
            <SelectedChips
              values={multiValues}
              onRemove={(v) => onChange(multiValues.filter((x) => x !== v))}
            />
          ) : null}
          <Stack gap={1.5}>
            {question.options.map((option) => (
              <MultiOption
                key={option}
                option={option}
                isSelected={multiValues.includes(option)}
                onToggle={() =>
                  onChange(
                    multiValues.includes(option)
                      ? multiValues.filter((v) => v !== option)
                      : [...multiValues, option],
                  )
                }
              />
            ))}
          </Stack>
          {hasOtherInMulti ? (
            <Input
              value={customText}
              onChange={(e) => onCustomTextChange?.(e.target.value)}
              placeholder="Especifica..."
              size="md"
              borderRadius="lg"
              borderColor="#76ABAE"
              bg="white"
              color="#303841"
              _placeholder={{ color: "gray.400" }}
              _focus={{
                borderColor: "#76ABAE",
                boxShadow: "0 0 0 1px #76ABAE",
              }}
              mt={1}
            />
          ) : null}
        </VStack>
      ) : null}
    </VStack>
  );
}
