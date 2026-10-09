import { Box, Container, Heading, List, Text } from "@chakra-ui/react";

export const metadata = {
  title: "Términos y Condiciones — La U del Futuro 2026 · UTPton",
  description:
    "Términos para consultar el programa y realizar donaciones voluntarias a UTPton.",
};

export default function TerminosPage() {
  return (
    <Container
      maxW="4xl"
      py={10}
      pt="20"
      color="brand.light"
      lineHeight="1.7"
      fontFamily="body"
    >
      <Box
        as="header"
        bgGradient="linear(to-br, brand.blue-dark, brand.blue-panel)"
        borderRadius="lg"
        borderLeft="4px solid"
        borderColor="utp.azul"
        p={6}
        mb={6}
      >
        <Heading
          as="h1"
          fontSize={{ base: "lg", md: "xl" }}
          fontWeight="bold"
          textTransform="uppercase"
          color="brand.light"
          mb={2}
        >
          Términos y Condiciones del Servicio
        </Heading>

        <Text color="utp.azul" fontSize="0.95rem" mb={4}>
          Plataforma Web Institucional: La U del Futuro 2026 · UTPton
        </Text>

        <Box
          fontSize="0.85rem"
          color="brand.muted"
          borderTop="1px solid"
          borderColor="whiteAlpha.300"
          pt={3}
          display="grid"
          gridTemplateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
          gap={3}
        >
          <Box>
            <strong style={{ color: "white" }}>Entidades Responsables:</strong>{" "}
            Universidad Tecnológica de Pereira (UTP) & Asociación de Egresados
            UTP (ASE UTP)
            <br />
            <strong style={{ color: "white" }}>Marco Normativo:</strong> Ley
            1581 de 2012, Ley 1266 de 2008, Ley 1480 de 2011, Modelo ISO 27001
            / MinTIC
          </Box>

          <Box>
            <strong style={{ color: "white" }}>Vigencia y Versión:</strong>{" "}
            Versión 2.0 (Actualizado a Agosto de 2026)
            <br />
            <strong style={{ color: "white" }}>
              Contacto para Términos:
            </strong>{" "}
            egresados@utp.edu.co | aseutp@utp.edu.co | Conmutador (+57) (606)
            313 7300
          </Box>
        </Box>
      </Box>

      <Section
        title="1. Aceptación Vinculante y Descripción del Servicio"
        body={
          <>
            <Text mb={3}>
              Estos términos regulan el uso de la página informativa de La U
              del Futuro 2026 y del módulo de donaciones UTPton de la
              Universidad Tecnológica de Pereira y la Asociación de Egresados
              UTP. La página publica el programa del evento y permite realizar
              aportes solidarios voluntarios.
            </Text>

            <Text mb={3}>
              El uso del módulo de donaciones implica aceptación de estos términos.
            </Text>

            <Text mb={3}>
              El tratamiento de datos personales recolectados con ocasión del
              uso de la plataforma se rige por la{" "}
              <a
                href="/privacidad"
                style={{
                  color: "var(--chakra-colors-utp-azul)",
                  textDecoration: "underline",
                }}
              >
                Política de Privacidad
              </a>
              , documento complementario al presente.
            </Text>
          </>
        }
      />

      <Section
        title="2. Acceso público y administración"
        body={
          <>
            <Text mb={3}>
              No se requiere crear una cuenta, iniciar sesión ni comprar una
              entrada para consultar el programa o realizar una donación. El
              acceso administrativo está reservado al personal autorizado.
            </Text>

            <Text mb={3}>
              Las páginas de compra, registro y asistencia del evento no están
              habilitadas en esta edición.
            </Text>
          </>
        }
      />

      <Section
        title="3. Donaciones voluntarias y procesamiento de pagos"
        body={
          <>
            <Text mb={3}>
              Los aportes realizados desde esta página son voluntarios y se
              destinan exclusivamente a UTPton para apoyar a la comunidad UTP
              afectada por el sismo. No constituyen el pago de una entrada ni
              son requisito para participar en la jornada.
            </Text>

            <Text mb={3}>
              El pago se procesa mediante el proveedor ePayco ya integrado.
              Los datos de tarjeta se ingresan en la plataforma del proveedor;
              la organización recibe la confirmación de la transacción para
              registrar el aporte.
            </Text>
          </>
        }
        highlight={
          <Text fontSize="0.9rem">
            La organización no solicita claves ni códigos de seguridad por
            correo, mensajería o redes sociales.
          </Text>
        }
      />

      <Section
        title="4. Consultas sobre aportes"
        body={
          <>
            <Text mb={3}>
              Para consultas sobre un aporte o una transacción, el donante
              puede comunicarse con la Asociación de Egresados UTP por sus
              canales institucionales. Los pagos se procesan según las
              condiciones del proveedor y la normativa aplicable.
            </Text>

            <Text mb={3}>
              Canales de contacto:
            </Text>

            <List.Root pl={5}>
              <List.Item mb={2}>
                <strong>Correo:</strong> egresados@utp.edu.co o aseutp@utp.edu.co.
              </List.Item>
              <List.Item mb={2}>
                Incluye la referencia de la transacción si la tienes disponible.
              </List.Item>
            </List.Root>
          </>
        }
        highlight={
          <Text fontSize="0.9rem">
            <strong style={{ color: "brand.light" }}>
              Información de donaciones:
            </strong>{" "}
            Una donación no reserva cupo, no genera acceso al evento y no es
            condición de asistencia.
          </Text>
        }
      />

      <Section
        title="5. Módulo de Donaciones y Transparencia"
        body={
          <>
            <Text mb={3}>
              El módulo recibe aportes exclusivamente para UTPton, de forma
              anónima y sin crear una cuenta. Para completar el aporte se
              solicita la declaración del origen lícito de los fondos mediante
              el checkbox:{" "}
              <em>
                &quot;Declaro que los recursos entregados en donación provienen de
                una fuente lícita&quot;
              </em>
              .
            </Text>

            <Text mb={3}>
              La donación no garantiza una deducción tributaria automática. El
              donante debe consultar la normativa vigente y los requisitos
              aplicables para su situación.
            </Text>
          </>
        }
      />

      <Section
        title="6. Propiedad Intelectual, Conductas Prohibidas y Sanciones"
        body={
          <>
            <Text mb={3}>
              <strong>Propiedad Intelectual:</strong> Todo el contenido
              disponible en la plataforma (marcas, logos, textos, imágenes,
              diseños y archivos multimedia) es propiedad de la
              Universidad Tecnológica de Pereira (UTP) y la Asociación de
              Egresados (ASE UTP), o de sus licenciantes. No está permitida su
              reproducción, distribución o modificación sin autorización
              escrita.
            </Text>

            <Text mb={3}>
              <strong>Conductas Prohibidas:</strong>
            </Text>

            <List.Root pl={5}>
              <List.Item mb={2}>
                Realizar ingeniería inversa sobre la plataforma o sus
                integraciones.
              </List.Item>
              <List.Item mb={2}>
                Difusión de contenido malicioso, fraudulento o que afecte la
                integridad de otros usuarios.
              </List.Item>
              <List.Item>
                Uso de la plataforma con fines distintos a los expresamente
                autorizados.
              </List.Item>
            </List.Root>

            <Text mt={4}>
              <strong>Medidas:</strong> La organización podrá limitar el
              acceso a servicios administrativos cuando se detecte un uso
              indebido, sin perjuicio de las acciones legales aplicables.
            </Text>
          </>
        }
      />

      <Section
        title="7. Modificaciones y ley aplicable"
        body={
          <>
            <Text mb={3}>
              <strong>Limitaciones de Responsabilidad:</strong> La organización
              no será responsable por daños derivados de caso fortuito, fuerza
              mayor, interrupciones del servicio por mantenimiento, fallos
              atribuibles a los proveedores de infraestructura (Render,
              Supabase, Vercel, AWS) ni por uso indebido de las credenciales
              de acceso por parte del titular.
            </Text>

            <Text mb={3}>
              <strong>Modificaciones a los Términos:</strong> La organización
              se reserva el derecho de modificar los presentes términos en
              cualquier momento. Los cambios serán notificados a través del
              portal y, si continúas utilizando el servicio después de dichas
              modificaciones, aceptas los nuevos términos. La versión vigente
              estará siempre publicada en{" "}
              <a
                href="/terminos"
                style={{
                  color: "var(--chakra-colors-utp-azul)",
                  textDecoration: "underline",
                }}
              >
                /terminos
              </a>
              .
            </Text>

            <Text mb={3}>
              <strong>Ley Aplicable y Jurisdicción:</strong> Los presentes
              términos se rigen por las leyes de la República de Colombia.
              Cualquier controversia será resuelta por los jueces competentes
              de la ciudad de Pereira (Risaralda), salvo normas de protección
              al consumidor que establezcan fuero distinto.
            </Text>

            <Text mb={3}>
              <strong>Compliance Integral:</strong> La plataforma integra los
              12 controles de seguridad alineados con el estándar ISO 27001 y
              los lineamientos de Gobierno Digital de MinTIC, en cumplimiento
              del marco normativo colombiano (Leyes 1581, 1266 y 1480).
            </Text>

            <Box
              bg="brand.blue-panel"
              border="1px solid"
              borderColor="whiteAlpha.200"
              borderLeft="4px solid"
              borderLeftColor="utp.azul"
              borderRadius="md"
              p={4}
              fontSize="0.85rem"
            >
              <Text
                color="utp.azul"
                textTransform="uppercase"
                fontWeight="bold"
                fontSize="0.85rem"
                mb={2}
              >
              Seguridad del servicio
              </Text>

              <Text color="brand.muted">
                El acceso administrativo se limita al personal autorizado. El
                pago de donaciones se completa en el proveedor ePayco; evita
                compartir claves o códigos de seguridad por canales no oficiales.
              </Text>
            </Box>
          </>
        }
      />

      <Box
        as="footer"
        borderTop="1px solid"
        borderColor="whiteAlpha.300"
        pt={4}
        mt={6}
        fontSize="0.85rem"
        color="brand.muted"
      >
        <Text mb={2}>
          <strong style={{ color: "brand.light" }}>Aceptación Formal:</strong>{" "}
          El usuario declara haber leído y comprendido estos términos al usar
          el módulo de donaciones UTPton.
        </Text>

        <Text>
          © 2026 Universidad Tecnológica de Pereira (UTP) & Asociación de
          Egresados UTP (ASE UTP). Todos los derechos reservados.
        </Text>
      </Box>
    </Container>
  );
}

function Section({
  title,
  body,
  highlight,
  table,
  trailing,
}: {
  title: string;
  body: React.ReactNode;
  highlight?: React.ReactNode;
  table?: React.ReactNode;
  trailing?: React.ReactNode;
}) {
  return (
    <Box as="section" mb={6}>
      <Heading
        as="h2"
        fontSize="1.2rem"
        color="brand.light"
        borderLeft="4px solid"
        borderColor="utp.azul"
        pl={3}
        mb={3}
        textTransform="uppercase"
      >
        {title}
      </Heading>

      {body}

      {highlight ? (
        <Box
          bg="brand.blue-panel"
          border="1px solid"
          borderColor="whiteAlpha.200"
          borderLeft="4px solid"
          borderLeftColor="utp.azul"
          borderRadius="md"
          p={3}
          mt={3}
          fontSize="0.9rem"
          color="brand.light"
        >
          {highlight}
        </Box>
      ) : null}
      {table}
      {trailing}
    </Box>
  );
}
