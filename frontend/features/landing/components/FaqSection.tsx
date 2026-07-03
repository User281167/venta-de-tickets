"use client";

import {
  Accordion,
  Box,
  Container,
  Heading,
  Stack,
  Text,
} from "@chakra-ui/react";

const FAQ_ITEMS = [
  {
    value: "publico",
    question: "Quien puede asistir?",
    answer:
      "Egresados, estudiantes, docentes, aliados, empresas y comunidad interesada en innovación, cultura y futuro profesional.",
  },
  {
    value: "fechas",
    question: "Cuando sera La U del Futuro?",
    answer:
      "La convención se realizara el 22, 23 y 24 de octubre de 2026 en la Universidad Tecnológica de Pereira.",
  },
  {
    value: "certificado",
    question: "Recibire certificado?",
    answer:
      "Las actividades académicas con registro habilitado podran entregar certificado digital segun modalidad y asistencia.",
  },
  {
    value: "entradas",
    question: "Como aseguro mi cupo?",
    answer:
      "Selecciona una entrada disponible, inicia sesion y completa el proceso de compra o inscripción desde la plataforma.",
  },
];

export function FaqSection() {
  return (
    <Box
      py={{ base: 14, md: 20 }}
      bg="linear-gradient(180deg, #020414 0%, #050719 48%, #020414 100%)"
    >
      <Container maxW="860px" px={{ base: 4, md: 6 }}>
        <Stack gap={3} align="center" textAlign="center" mb={10}>
          <Text
            color="brand.pink"
            fontSize="xs"
            fontWeight="black"
            textTransform="uppercase"
          >
            Información clave
          </Text>
          <Heading color="white" fontSize={{ base: "3xl", md: "4xl" }}>
            Preguntas frecuentes
          </Heading>
        </Stack>

        <Accordion.Root defaultValue={[]} collapsible>
          {FAQ_ITEMS.map((item) => (
            <Accordion.Item
              key={item.value}
              value={item.value}
              borderBottomWidth={1}
              borderColor="rgba(255,255,255,0.1)"
              py={2}
            >
              <Accordion.ItemTrigger cursor="pointer" py={3}>
                <Box flex={1} textAlign="start">
                  <Text fontWeight="black" color="white">
                    {item.question}
                  </Text>
                </Box>
                <Accordion.ItemIndicator color="brand.cyan" />
              </Accordion.ItemTrigger>
              <Accordion.ItemContent pb={4}>
                <Accordion.ItemBody>
                  <Text color="brand.muted" lineHeight="1.7">
                    {item.answer}
                  </Text>
                </Accordion.ItemBody>
              </Accordion.ItemContent>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </Container>
    </Box>
  );
}
