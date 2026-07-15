"use client";

import {
  Accordion,
  Box,
  Container,
  Heading,
  Stack,
  Text,
} from "@chakra-ui/react";
import { AnimatedSection } from "@/shared/components/AnimatedSection";

const FAQ_ITEMS = [
  {
    value: "publico",
    question: "¿Quién puede asistir?",
    answer:
      "Egresados, estudiantes, docentes, aliados, empresas y toda la comunidad interesada en innovación, cultura y futuro profesional.",
  },
  {
    value: "fechas",
    question: "¿Cuándo será La U del Futuro?",
    answer:
      "La convención se realizará el 22, 23 y 24 de octubre de 2026 en la Universidad Tecnológica de Pereira.",
  },
  {
    value: "certificado",
    question: "¿Recibiré certificado?",
    answer:
      "Las actividades académicas con registro habilitado podrán entregar certificado digital según modalidad y asistencia.",
  },
  {
    value: "entradas",
    question: "¿Cómo aseguro mi cupo?",
    answer:
      "Selecciona una entrada disponible, inicia sesión y completa el proceso de compra o inscripción desde la plataforma.",
  },
  {
    value: "aliados",
    question: "¿Puedo ser aliado o patrocinador?",
    answer:
      "Sí. Escríbenos a través del formulario de contacto y nuestro equipo te orientará sobre las oportunidades de alianza.",
  },
];

export function FaqSection() {
  return (
    <Box
      py={{ base: 16, md: 24 }}
      bg="linear-gradient(180deg, #020414 0%, #050719 48%, #020414 100%)"
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        w="700px"
        h="700px"
        borderRadius="full"
        bg="radial-gradient(circle, rgba(0,229,255,0.06) 0%, transparent 70%)"
        pointerEvents="none"
      />

      <Container maxW="860px" px={{ base: 4, md: 6 }} position="relative" zIndex={1}>
        <AnimatedSection direction="up" delay={0} duration={0.6}>
          <Stack gap={4} align="center" textAlign="center" mb={14}>
          <Text
            color="brand.pink"
            fontSize="sm"
            fontWeight="black"
            textTransform="uppercase"
            letterSpacing="0.15em"
          >
            Información clave
          </Text>
          <Heading color="white" fontSize={{ base: "3xl", md: "5xl" }} lineHeight="1.1">
            Preguntas frecuentes
          </Heading>
        </Stack>
        </AnimatedSection>

        <AnimatedSection direction="up" delay={0} duration={0.6}>
          <Accordion.Root defaultValue={[]} collapsible>
          {FAQ_ITEMS.map((item) => (
            <Accordion.Item
              key={item.value}
              value={item.value}
              borderBottomWidth={1}
              borderColor="rgba(255,255,255,0.1)"
              py={2}
              className="glass-card"
              my={3}
              borderRadius="xl"
              px={{ base: 4, md: 6 }}
              transition="all 0.2s ease"
              _hover={{
                borderColor: "rgba(255,255,255,0.18)",
              }}
            >
              <Accordion.ItemTrigger cursor="pointer" py={4}>
                <Box flex={1} textAlign="start">
                  <Text fontWeight="black" color="white" fontSize={{ base: "md", md: "lg" }}>
                    {item.question}
                  </Text>
                </Box>
                <Accordion.ItemIndicator color="brand.cyan" />
              </Accordion.ItemTrigger>
              <Accordion.ItemContent pb={4}>
                <Accordion.ItemBody>
                  <Text color="brand.muted" lineHeight="1.7" fontSize={{ base: "sm", md: "md" }}>
                    {item.answer}
                  </Text>
                </Accordion.ItemBody>
              </Accordion.ItemContent>
            </Accordion.Item>
          ))}
          </Accordion.Root>
        </AnimatedSection>
      </Container>
    </Box>
  );
}
