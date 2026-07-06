import {
  Box,
  Container,
  Heading,
  HStack,
  Link as ChakraLink,
  Text,
  VStack,
} from "@chakra-ui/react";
import { IconArrowLeft } from "@tabler/icons-react";
import NextLink from "next/link";
import { Footer } from "@/components/layout/Footer";

export default function TerminosPage() {
  return (
    <Box bg="gray.50">
      <Box py={10}>
        <Container maxW="3xl">
          <VStack gap={8} align="stretch">
            <HStack>
              <ChakraLink asChild color="teal.600" fontSize="sm">
                <NextLink href="/">
                  <HStack gap={1}>
                    <IconArrowLeft size={16} />
                    <Text>Volver al inicio</Text>
                  </HStack>
                </NextLink>
              </ChakraLink>
            </HStack>

            <Heading as="h1" size="xl" color="gray.800">
              Términos y Condiciones
            </Heading>

            <Text color="gray.500" fontSize="sm" lineHeight="1.7">
              <strong>Última actualización:</strong> Junio 2026
            </Text>

            <VStack
              gap={5}
              align="stretch"
              color="gray.600"
              fontSize="sm"
              lineHeight="1.7"
            >
              <Text>
                Bienvenido a La Convención 2026. Al registrarte y utilizar
                nuestros servicios, aceptas los siguientes términos y
                condiciones. Te recomendamos leerlos detenidamente antes de
                completar tu registro.
              </Text>

              <Box>
                <Heading as="h2" size="md" color="gray.800" mb={3}>
                  1. Descripción del Servicio
                </Heading>
                <Text>
                  La Convención 2026 es un evento de innovación y tecnología.
                  Nuestra plataforma permite a los asistentes registrarse,
                  adquirir entradas, gestionar su agenda personal y recibir
                  comunicaciones relacionadas con el evento.
                </Text>
              </Box>

              <Box>
                <Heading as="h2" size="md" color="gray.800" mb={3}>
                  2. Registro y Cuenta
                </Heading>
                <Text>
                  Para acceder a los servicios, debes crear una cuenta
                  proporcionando tu correo electrónico y una contraseña. Eres
                  responsable de mantener la confidencialidad de tus
                  credenciales y de todas las actividades realizadas desde tu
                  cuenta.
                </Text>
              </Box>

              <Box>
                <Heading as="h2" size="md" color="gray.800" mb={3}>
                  3. Uso de Datos Personales
                </Heading>
                <Text>
                  Los datos personales proporcionados serán utilizados
                  exclusivamente para los fines del registro, comunicación y
                  organización del evento. No compartiremos tus datos con
                  terceros sin tu consentimiento explícito, salvo obligación
                  legal. Para más información, consulta nuestra{" "}
                  <ChakraLink asChild color="teal.600">
                    <NextLink href="/privacidad">
                      política de privacidad
                    </NextLink>
                  </ChakraLink>
                  .
                </Text>
              </Box>

              <Box>
                <Heading as="h2" size="md" color="gray.800" mb={3}>
                  4. Propiedad Intelectual
                </Heading>
                <Text>
                  Todo el contenido disponible en la plataforma (marcas, logos,
                  textos, imágenes) es propiedad de La Convención 2026 o de sus
                  licenciantes. No está permitida su reproducción sin
                  autorización.
                </Text>
              </Box>

              <Box>
                <Heading as="h2" size="md" color="gray.800" mb={3}>
                  5. Modificaciones
                </Heading>
                <Text>
                  Nos reservamos el derecho de modificar estos términos en
                  cualquier momento. Los cambios serán notificados a través de
                  la plataforma y, si continúas utilizando el servicio después
                  de dichas modificaciones, aceptas los nuevos términos.
                </Text>
              </Box>

              <Box>
                <Heading as="h2" size="md" color="gray.800" mb={3}>
                  6. Contacto
                </Heading>
                <Text>
                  Si tienes preguntas sobre estos términos, puedes contactarnos
                  a través de nuestro correo electrónico de soporte.
                </Text>
              </Box>
            </VStack>
          </VStack>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
}
