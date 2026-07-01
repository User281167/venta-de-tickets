"use client";

import { useRef, useState } from "react";
import {
  Box,
  Button,
  Center,
  Flex,
  HStack,
  Heading,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  IconArrowLeft,
  IconArrowRight,
  IconBrain,
  IconConfetti,
  IconPlayerSkipForward,
  IconSparkles,
} from "@tabler/icons-react";
import { toaster } from "@/components/ui/toaster";

import { useSubmitOnboarding } from "../api/surveys.queries";

import { ONBOARDING_QUESTIONS } from "../config/onboarding.questions";
import { SurveyQuestion } from "./SurveyQuestion";
import { SurveySkipModal } from "./SurveySkipModal";

type AnswerState = Record<string, string | string[]>;

export function OnboardingSurvey() {
  const submitMutation = useSubmitOnboarding();
  const [currentStep, setCurrentStep] = useState(0);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const totalSteps = ONBOARDING_QUESTIONS.length + 1;

  const initialAnswers: AnswerState = ONBOARDING_QUESTIONS.reduce((acc, q) => {
    acc[q.id] = q.type === "multi" ? [] : "";
    return acc;
  }, {} as AnswerState);
  const [answers, setAnswers] = useState<AnswerState>(initialAnswers);
  const [customTexts, setCustomTexts] = useState<Record<string, string>>({});

  const isWelcomeStep = currentStep === 0;
  const questionIndex = currentStep - 1;
  const currentQuestion = isWelcomeStep
    ? null
    : ONBOARDING_QUESTIONS[questionIndex];
  const isLastQuestion = questionIndex === ONBOARDING_QUESTIONS.length - 1;

  const scrollToTop = () => {
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAnswerChange = (questionId: string, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleCustomTextChange = (questionId: string, text: string) => {
    setCustomTexts((prev) => ({ ...prev, [questionId]: text }));
  };

  const canProceed = () => {
    if (!currentQuestion) return true;
    if (!currentQuestion.required) return true;

    const v = answers[currentQuestion.id];

    if (currentQuestion.type === "multi") {
      return (v as string[]).length > 0;
    }

    return v !== "";
  };

  const goToNextQuestion = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((s) => s + 1);
      scrollToTop();
    }
  };

  const goToPrevQuestion = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
      scrollToTop();
    }
  };

  const handleSubmit = async () => {
    try {
      const responses = Object.entries(answers).map(([questionId, answer]) => {
        const custom = customTexts[questionId];

        if (custom) {
          return { question_id: questionId, answer: `Otro: ${custom}` };
        }

        return { question_id: questionId, answer };
      });

      await submitMutation.mutateAsync({ responses });
      setShowSuccess(true);
      setTimeout(() => {
        toaster.create({
          title: "¡Bienvenido!",
          description: "Gracias por contarnos sobre ti.",
          type: "success",
        });
      }, 400);
    } catch (error) {
      toaster.create({
        title: "Error al enviar",
        description: (error as Error).message,
        type: "error",
      });
    }
  };

  const handleSkip = async () => {
    setShowSkipModal(false);

    try {
      await submitMutation.mutateAsync({ responses: [] });
      setShowSuccess(true);
    } catch (error) {
      toaster.create({
        title: "Error",
        description: (error as Error).message,
        type: "error",
      });
    }
  };

  if (showSuccess) return null;

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      bg="rgba(48, 56, 65, 0.55)"
      backdropFilter="blur(4px)"
      zIndex="overlay"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <Box
        maxW="lg"
        w="full"
        maxH="90vh"
        bg="white"
        borderRadius="2xl"
        overflow="hidden"
        boxShadow="2xl"
        display="flex"
        flexDir="column"
      >
        <Box
          px={6}
          pt={6}
          pb={4}
          borderBottomWidth={1}
          borderBottomColor="gray.100"
        >
          <HStack gap={3} mb={3}>
            <Center w={10} h={10} bg="#F0F7F7" borderRadius="lg">
              <IconBrain size={22} color="#76ABAE" />
            </Center>

            <VStack align="start" gap={0}>
              <Heading as="h2" size="md" fontWeight="bold" color="#303841">
                {isWelcomeStep ? "¡Bienvenido!" : "Cuéntanos sobre ti"}
              </Heading>

              <Text fontSize="xs" color="gray.400">
                {isWelcomeStep
                  ? "Future Minds 2026"
                  : `Paso ${currentStep} de ${totalSteps - 1}`}
              </Text>
            </VStack>
          </HStack>

          {!isWelcomeStep ? (
            <Flex gap={1.5}>
              {Array.from({ length: totalSteps - 1 }).map((_, i) => (
                <Box
                  key={i}
                  flex={1}
                  h="3px"
                  bg={i < currentStep ? "#76ABAE" : "gray.200"}
                  borderRadius="full"
                  transition="background 0.3s"
                />
              ))}
            </Flex>
          ) : null}
        </Box>

        <Box ref={contentRef} flex={1} overflowY="auto" px={6} py={5}>
          {isWelcomeStep ? (
            <VStack gap={6} py={6} textAlign="center">
              <Center w={20} h={20} bg="#F0F7F7" borderRadius="full">
                <IconSparkles size={40} color="#76ABAE" />
              </Center>

              <VStack gap={2}>
                <Heading as="h3" size="sm" color="#303841">
                  Personaliza tu experiencia
                </Heading>

                <Text
                  color="gray.500"
                  fontSize="sm"
                  lineHeight="tall"
                  maxW="sm"
                >
                  Responde estas preguntas rápidas para ayudarnos a adaptar
                  Future Minds 2026 a tus intereses. Solo te tomará un minuto.
                </Text>
              </VStack>

              <VStack gap={2} w="full" pt={1}>
                <Button
                  onClick={goToNextQuestion}
                  size="lg"
                  w="full"
                  colorPalette="teal"
                  _hover={{ transform: "translateY(-1px)", boxShadow: "md" }}
                >
                  <HStack gap={2}>
                    <Text>Comenzar encuesta</Text>
                    <IconArrowRight size={18} />
                  </HStack>
                </Button>

                <Button
                  onClick={() => setShowSkipModal(true)}
                  variant="ghost"
                  size="sm"
                  color="gray.400"
                  _hover={{ color: "gray.600", bg: "gray.50" }}
                >
                  <HStack gap={1.5}>
                    <IconPlayerSkipForward size={14} />
                    <Text>Omitir encuesta</Text>
                  </HStack>
                </Button>
              </VStack>
            </VStack>
          ) : currentQuestion ? (
            <VStack gap={4} align="stretch">
              <VStack gap={1} align="stretch">
                <Text fontSize="xs" color="gray.400" fontWeight="medium">
                  Pregunta {questionIndex + 1} de {ONBOARDING_QUESTIONS.length}
                </Text>

                <Heading as="h3" size="sm" color="#303841">
                  {currentQuestion.question}
                </Heading>
              </VStack>
              <SurveyQuestion
                key={currentQuestion.id}
                question={currentQuestion}
                value={answers[currentQuestion.id]}
                onChange={(v) => handleAnswerChange(currentQuestion.id, v)}
                customText={customTexts[currentQuestion.id] ?? ""}
                onCustomTextChange={(t) =>
                  handleCustomTextChange(currentQuestion.id, t)
                }
              />
            </VStack>
          ) : null}
        </Box>

        {!isWelcomeStep ? (
          <Box
            px={6}
            py={4}
            borderTopWidth={1}
            borderTopColor="gray.100"
            bg="gray.50"
          >
            <HStack gap={3} justify="space-between">
              {currentStep > 1 ? (
                <Button
                  onClick={goToPrevQuestion}
                  variant="outline"
                  size="sm"
                  color="gray.600"
                  borderColor="gray.200"
                  _hover={{ bg: "gray.100" }}
                >
                  <HStack gap={1}>
                    <IconArrowLeft size={15} />
                    <Text>Anterior</Text>
                  </HStack>
                </Button>
              ) : (
                <Box />
              )}

              <HStack gap={2}>
                <Button
                  onClick={() => setShowSkipModal(true)}
                  variant="ghost"
                  size="sm"
                  color="gray.400"
                  _hover={{ color: "gray.600", bg: "gray.100" }}
                >
                  <HStack gap={1}>
                    <IconPlayerSkipForward size={13} />
                    <Text>Saltar</Text>
                  </HStack>
                </Button>

                {isLastQuestion ? (
                  <Button
                    onClick={handleSubmit}
                    loading={submitMutation.isPending}
                    disabled={!canProceed()}
                    colorPalette="teal"
                    size="sm"
                    _hover={{ transform: "translateY(-1px)", boxShadow: "md" }}
                  >
                    <HStack gap={1}>
                      <IconConfetti size={15} />
                      <Text>Finalizar</Text>
                    </HStack>
                  </Button>
                ) : (
                  <Button
                    onClick={goToNextQuestion}
                    disabled={!canProceed()}
                    colorPalette="teal"
                    size="sm"
                    _hover={{ transform: "translateY(-1px)", boxShadow: "md" }}
                  >
                    <HStack gap={1}>
                      <Text>Siguiente</Text>
                      <IconArrowRight size={15} />
                    </HStack>
                  </Button>
                )}
              </HStack>
            </HStack>
          </Box>
        ) : null}
      </Box>

      <SurveySkipModal
        isOpen={showSkipModal}
        onClose={() => setShowSkipModal(false)}
        onConfirm={handleSkip}
        isLoading={submitMutation.isPending}
      />
    </Box>
  );
}
