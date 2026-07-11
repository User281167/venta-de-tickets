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

export default function PrivacidadPage() {
  return (
    <Box bg="brand.dark">
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

            <Heading as="h1" size="xl" color="gray.3  00">
              Política de Privacidad
            </Heading>

            <Text color="gray.300" fontSize="sm" lineHeight="1.7">
              <strong>Última actualización:</strong> Junio 2026
            </Text>

            <VStack
              gap={5}
              align="stretch"
              color="gray.400"
              fontSize="sm"
              lineHeight="1.7"
            >
              <Text>
                En cumplimiento de la Ley 1581 de 2012 de Protección de Datos
                Personales en Colombia y sus decretos reglamentarios,
                presentamos nuestra política de privacidad para el evento Future
                Minds 2026.
              </Text>

              <Box>
                <Heading as="h2" size="md" color="gray.200" mb={3}>
                  1. Responsable del Tratamiento
                </Heading>
                <Text>
                  La Convención 2026 es el responsable del tratamiento de tus
                  datos personales. Al registrarte, autorizas el tratamiento de
                  tu información conforme a lo descrito en esta política.
                </Text>
              </Box>

              <Box>
                <Heading as="h2" size="md" color="gray.200" mb={3}>
                  2. Datos Recolectados
                </Heading>
                <Text>
                  Recolectamos los siguientes datos personales: nombre completo,
                  correo electrónico, número de teléfono, e información
                  relacionada con tu participación en el evento (entradas
                  adquiridas, agenda, preferencias).
                </Text>
              </Box>

              <Box>
                <Heading as="h2" size="md" color="gray.200" mb={3}>
                  3. Finalidades del Tratamiento
                </Heading>
                <Text>
                  Tus datos serán utilizados para las siguientes finalidades:
                </Text>
                <VStack gap={1} align="stretch" pl={4} mt={2}>
                  <Text>- Registro y autenticación en la plataforma</Text>
                  <Text>- Compra y gestión de entradas</Text>
                  <Text>- Comunicaciones relacionadas con el evento</Text>
                  <Text>- Personalización de la experiencia del asistente</Text>
                  <Text>- Mejora continua de nuestros servicios</Text>
                </VStack>
              </Box>

              <Box>
                <Heading as="h2" size="md" color="gray.200" mb={3}>
                  4. Derechos del Titular (ARCO)
                </Heading>
                <Text>
                  De acuerdo con la Ley 1581, tienes los siguientes derechos
                  sobre tus datos personales:
                </Text>
                <VStack gap={1} align="stretch" pl={4} mt={2}>
                  <Text>
                    <strong>Acceder</strong>: Conocer qué datos tuyos tenemos
                    almacenados
                  </Text>
                  <Text>
                    <strong>Rectificar</strong>: Solicitar la corrección de
                    datos inexactos
                  </Text>
                  <Text>
                    <strong>Cancelar</strong>: Solicitar la eliminación de tus
                    datos
                  </Text>
                  <Text>
                    <strong>Oponerse</strong>: Solicitar que no se usen tus
                    datos para ciertos fines
                  </Text>
                </VStack>
              </Box>

              <Box>
                <Heading as="h2" size="md" color="gray.200" mb={3}>
                  5. Almacenamiento y Seguridad
                </Heading>
                <Text>
                  Tus datos personales serán almacenados de forma segura
                  utilizando medidas técnicas y organizativas adecuadas para
                  protegerlos contra accesos no autorizados, pérdida o
                  alteración. Los datos se conservarán durante el tiempo
                  necesario para cumplir con las finalidades descritas y durante
                  los plazos legales aplicables.
                </Text>
              </Box>

              <Box>
                <Heading as="h2" size="md" color="gray.200" mb={3}>
                  6. Transferencia de Datos
                </Heading>
                <Text>
                  No compartiremos tus datos personales con terceros sin tu
                  consentimiento explícito, salvo cuando sea requerido por ley o
                  para proveedores de servicios esenciales para el evento
                  (procesamiento de pagos, envío de correos electrónicos),
                  quienes están sujetos a acuerdos de confidencialidad.
                </Text>
              </Box>

              <Box>
                <Heading as="h2" size="md" color="gray.200" mb={3}>
                  7. Ejercicio de Derechos
                </Heading>
                <Text>
                  Para ejercer tus derechos ARCO, puedes contactarnos a través
                  de nuestro correo electrónico. Responderemos a tu solicitud en
                  un plazo máximo de 15 días hábiles, conforme a la normativa
                  colombiana.
                </Text>
              </Box>

              <Box>
                <Heading as="h2" size="md" color="gray.200" mb={3}>
                  8. Cambios a esta Política
                </Heading>
                <Text>
                  Nos reservamos el derecho de actualizar esta política de
                  privacidad en cualquier momento. Los cambios serán notificados
                  a través de la plataforma y, si continúas utilizando el
                  servicio después de dichas modificaciones, aceptas la política
                  actualizada.
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
