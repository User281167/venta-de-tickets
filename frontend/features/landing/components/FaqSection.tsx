"use client";

import { Accordion, Box, Container, Heading, Stack, Text } from "@chakra-ui/react";

const FAQ_ITEMS = [
  {
    value: "estudiante",
    question: "¿Necesito ser estudiante para asistir?",
    answer: "No, el evento está abierto a público general. Estudiantes, profesionales y cualquier persona interesada en tecnología, innovación y emprendimiento puede asistir.",
  },
  {
    value: "certificado",
    question: "¿Recibiré certificado?",
    answer: "Sí, todos los asistentes reciben certificado digital de participación.",
  },
  {
    value: "transferencia",
    question: "¿Puedo transferir mi ticket?",
    answer: "Sí, hasta 48 horas antes del evento. Solo debes enviar un correo a eventos@universidadcentral.edu con los datos del nuevo asistente.",
  },
  {
    value: "reembolso",
    question: "¿Hay reembolso?",
    answer: "Reembolsos disponibles hasta 7 días antes del evento. Después de esa fecha, puedes transferir tu entrada a otra persona.",
  },
];

export function FaqSection() {
  return (
    <Box py={20}>
      <Container maxW="800px" px={4}>
        <Stack gap={3} align="center" mb={10}>
          <Heading as="h2" size={{ base: "2xl", md: "3xl" }} color="brand.dark" textAlign="center">
            Preguntas frecuentes
          </Heading>
        </Stack>

        <Accordion.Root defaultValue={[]} collapsible>
          {FAQ_ITEMS.map((item) => (
            <Accordion.Item key={item.value} value={item.value} borderBottomWidth={1} borderColor="gray.200" py={2}>
              <Accordion.ItemTrigger cursor="pointer" py={3}>
                <Box flex={1} textAlign="start">
                  <Text fontWeight="medium" color="brand.dark">
                    {item.question}
                  </Text>
                </Box>
                <Accordion.ItemIndicator />
              </Accordion.ItemTrigger>
              <Accordion.ItemContent pb={4}>
                <Accordion.ItemBody>
                  <Text color="gray.600" lineHeight="1.7">
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
