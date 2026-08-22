import { Box, Container, Heading, List, Table, Text } from "@chakra-ui/react";

export const metadata = {
  title: "Política de Privacidad — ASE UTP 2026",
  description:
    "Política de Privacidad, Seguridad y Tratamiento de Datos Personales de la Asociación de Egresados UTP 2026 (ASE UTP).",
};

export default function PrivacidadPage() {
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
          Política de Privacidad, Seguridad y Tratamiento de Datos
        </Heading>

        <Text color="utp.azul" fontSize="0.95rem" mb={4}>
          Plataforma Web Institucional: Asociación de Egresados UTP 2026 (ASE
          UTP)
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
            1581 de 2012, Ley 1266 de 2008, Ley 1480 de 2011, Modelo ISO 27001 /
            MinTIC
          </Box>

          <Box>
            <strong style={{ color: "white" }}>Vigencia y Versión:</strong>{" "}
            Versión 3.0 (Actualizado a Agosto de 2026)
            <br />
            <strong style={{ color: "white" }}>
              Contacto de Privacidad:
            </strong>{" "}
            egresados@utp.edu.co | aseutp@utp.edu.co | Conmutador (+57) (606)
            313 7300
          </Box>
        </Box>
      </Box>

      <Section
        title="1. Objetivo y Alcance General"
        body={
          <>
            <Text mb={3}>
              El presente documento establece la{" "}
              <strong>
                Política de Privacidad, Seguridad y Tratamiento de Datos
                Personales
              </strong>{" "}
              aplicable a la plataforma web oficial de la Asociación de
              Egresados de la Universidad Tecnológica de Pereira (ASE UTP). La
              aceptación de estas políticas es obligatoria para todo usuario
              registrado, egresado, comprador, donante, administrador o tercero
              que interactúe con la plataforma.
            </Text>

            <Text mb={3}>
              Las condiciones comerciales de compra, las reglas del módulo de
              donaciones, los controles de seguridad (ISO 27001) y los
              aspectos de propiedad intelectual se rigen por los Términos y
              Condiciones del Servicio, disponibles en{" "}
              <a
                href="/terminos"
                style={{ color: "var(--chakra-colors-utp-azul)", textDecoration: "underline" }}
              >
                /terminos
              </a>
              .
            </Text>
          </>
        }
        highlight={
          <Text fontSize="0.9rem">
            <strong style={{ color: "brand.light" }}>
              Declaración de Transparencia de Donaciones:
            </strong>{" "}
            Esta política no rige aspectos tributarios ni contractuales del
            módulo de donaciones; para esos efectos consulta los Términos y
            Condiciones. La presente política aplica únicamente al tratamiento
            de los datos personales recolectados con ocasión del uso de la
            plataforma.
          </Text>
        }
      />

      <Section
        title="2. Tratamiento de Datos y Rol de Usuarios"
        body={
          <Text>
            La plataforma recopila y procesa datos estrictamente necesarios bajo
            el principio de minimización de datos (Artículo 4, Ley 1581 de
            2012):
          </Text>
        }
        table={
          <Table.Root size="sm" variant="line" mt={3} bg="brand.panel">
            <Table.Header>
              <Table.Row bg="brand.blue-dark">
                <Table.ColumnHeader color="brand.light">
                  Dato Recolectado
                </Table.ColumnHeader>

                <Table.ColumnHeader color="brand.light">
                  Carácter
                </Table.ColumnHeader>

                <Table.ColumnHeader color="brand.light">
                  Finalidad Específica
                </Table.ColumnHeader>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              <PolicyRow
                dato="Correo Electrónico y Contraseña"
                caracter="Obligatorio"
                finalidad="Autenticación de usuario, envío transaccional de accesos, recibos de pago y links de confirmación/rechazo."
              />
              <PolicyRow
                dato="Cédula de Ciudadanía / Documento"
                caracter="Obligatorio"
                finalidad="Verificación automática frente a la base de egresados UTP para aplicación de descuentos y control de identidad. Inmutable vía cliente."
                stripe
              />
              <PolicyRow
                dato="Nombre Completo"
                caracter="Obligatorio"
                finalidad="Personalización de compra, titulación del paquete de entradas y registro en lista oficial de asistentes."
              />
              <PolicyRow
                dato="Dirección y Teléfono"
                caracter="Opcional"
                finalidad="Facturación, soporte de entrega transaccional por WhatsApp y contacto de emergencia durante el evento."
                stripe
              />
              <PolicyRow
                dato="Historial y Estado de Compras / QR"
                caracter="Generado"
                finalidad="Validación en puerta (Check-in), prevención de fraudes, trazabilidad de accesos y control de aforo."
              />
            </Table.Body>
          </Table.Root>
        }
      />

      <Section
        title="3. Política de Cookies y Tecnologías de Seguimiento"
        body={
          <Text mb={3}>
            Nuestra plataforma web opera utilizando cookies técnicas y de sesión
            estrictamente necesarias para garantizar el funcionamiento seguro
            y la persistencia de autenticación de los usuarios.
          </Text>
        }
        highlight={
          <Box>
            <Text
              color="utp.azul"
              fontSize="0.85rem"
              textTransform="uppercase"
              fontWeight="bold"
              mb={2}
            >
              Notificación de Cookies en Plataforma
            </Text>

            <Text fontSize="0.85rem" color="brand.muted">
              <em>
                "Esta plataforma utiliza cookies técnicas estrictamente
                necesarias para mantener tu sesión activa y garantizar la
                seguridad de las transacciones (gestionadas de manera interna). Al navegar e iniciar sesión en el
                portal, aceptas su uso. No empleamos cookies para rastreo
                publicitario ni almacenamiento de datos de terceros."
              </em>
            </Text>
          </Box>
        }
        trailing={
          <Text mt={3}>
            Estas cookies no almacenan información de identificación personal
            en texto plano ni se comparten con redes de anuncios o analítica
            de terceros no autorizados.
          </Text>
        }
      />

      <Section
        title="4. Procedimiento para el Ejercicio de Derechos de Habeas Data (PQRS)"
        body={
          <>
            <Text mb={3}>
              De conformidad con los Artículos 14 y 15 de la Ley 1581 de 2012,
              los titulares de la información o sus causahabientes podrán
              ejercer sus derechos de conocer, actualizar, rectificar y
              suprimir sus datos personales o revocar la autorización otorgada
              a través de los canales institucionales dispuestos.
            </Text>

            <Box
              bg="brand.blue-panel"
              borderLeft="4px solid"
              borderColor="utp.azul"
              borderRadius="md"
              p={4}
              fontSize="0.9rem"
            >
              <strong style={{ color: "brand.light" }}>
                Tiempos Legalmente Estipulados para Respuestas (PQRS):
              </strong>

              <List.Root mt={2} pl={5} color="brand.muted">
                <List.Item mb={2}>
                  <strong>
                    Consultas (Información sobre datos almacenados):
                  </strong>{" "}
                  Se atenderán en un término máximo de{" "}
                  <strong>diez (10) días hábiles</strong> contados a partir de
                  la fecha de recibo de la solicitud. Cuando no fuere posible
                  atender la consulta dentro de dicho término, se informará al
                  interesado antes del vencimiento, expresando los motivos de
                  la demora y señalando la fecha en que se atenderá, la cual
                  no podrá superar los cinco (5) días hábiles siguientes.
                </List.Item>

                <List.Item>
                  <strong>
                    Reclamos (Actualización, corrección, supresión o
                    revocatoria):
                  </strong>{" "}
                  Se atenderán en un término máximo de{" "}
                  <strong>quince (15) días hábiles</strong> contados a partir
                  del día siguiente a la fecha de su recibo. Si el reclamo
                  resulta incompleto, se requerirá al interesado dentro de los
                  cinco (5) días siguientes a la recepción para que subsane
                  las fallas. Transcurridos dos (2) meses sin respuesta del
                  solicitante, se entenderá desistido el reclamo.
                </List.Item>
              </List.Root>
            </Box>
          </>
        }
        trailing={
          <Box mt={4}>
            <Heading as="h3" fontSize="1rem" color="brand.light" mb={2}>
              Canales Oficiales de Atención de Habeas Data
            </Heading>

            <List.Root pl={5} color="brand.muted">
              <List.Item>
                <strong>Correo:</strong> egresados@utp.edu.co |
                aseutp@utp.edu.co
              </List.Item>

              <List.Item>
                <strong>Dirección:</strong> Carrera 27 #10-02 Barrio Álamos,
                Edificio 15 C - 304, Pereira, Risaralda.
              </List.Item>

              <List.Item>
                <strong>Teléfonos:</strong> +57 606 313 7110 / 313 7533 ·
                Celular 3126539194 · Conmutador (+57) (606) 313 7300.
              </List.Item>
            </List.Root>
          </Box>
        }
      />

      <Section
        title="5. Transmisión y Traslado Internacional de Datos en la Nube"
        body={
          <>
            <Text mb={3}>
              Para la prestación eficiente de los servicios web, el
              procesamiento de autenticación y el almacenamiento resiliente de
              datos, la plataforma hace uso de infraestructura tecnológica
              proporcionada por proveedores internacionales especializados
              que actúan en calidad de{" "}
              <strong>Encargados del Tratamiento de Datos</strong> (incluyendo
              plataformas como{" "}
              <em>
                Render, Supabase, Next.js Hosting / Vercel, Unsplash y
                servicios cloud respaldados por Amazon Web Services - AWS
              </em>
              ).
            </Text>

            <Text mb={2}>
              <strong>Condiciones de la Transmisión Internacional:</strong>
            </Text>

            <List.Root pl={5}>
              <List.Item mb={2}>
                <strong>Estándares Equivalentes de Seguridad:</strong> Los
                centros de datos de dichos proveedores cuentan con
                certificaciones internacionales de seguridad (ISO 27001, SOC 2
                Type II) y garantizan esquemas de cifrado en reposo y en
                tránsito (TLS 1.3 / AES-256).
              </List.Item>

              <List.Item mb={2}>
                <strong>Limitación de Uso:</strong> Los Encargados tienen
                prohibido de manera explícita procesar, divulgar, comercializar
                o utilizar la información de los usuarios para fines distintos
                al alojamiento de la base de datos y la ejecución lógica de la
                aplicación web.
              </List.Item>

              <List.Item>
                <strong>Gestión de Incidentes:</strong> Ante cualquier
                eventualidad o brecha de seguridad reportada en la
                infraestructura subyacente de nuestros proveedores cloud, la
                UTP y ASE UTP activarán el protocolo de notificación a los
                usuarios afectados y a la Delegatura de Protección de Datos
                Personales de la Superintendencia de Industria y Comercio
                (SIC).
              </List.Item>
            </List.Root>
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
          El usuario declara haber leído, comprendido y aceptado en su
          totalidad la presente Política de Privacidad al registrarse o
          realizar transacciones en la plataforma oficial de la Asociación
          de Egresados UTP 2026 (ASE UTP).
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

function PolicyRow({
  dato,
  caracter,
  finalidad,
  stripe,
}: {
  dato: string;
  caracter: string;
  finalidad: string;
  stripe?: boolean;
}) {
  const chipStyle =
    caracter === "Obligatorio"
      ? { bg: "utp.azul", color: "brand.blue-dark" }
      : caracter === "Opcional"
        ? { bg: "utp.naranja", color: "brand.blue-dark" }
        : { bg: "brand.blue-panel", color: "brand.light" };

  return (
    <Table.Row bg={stripe ? "brand.panel" : "transparent"}>
      <Table.Cell color="brand.light" fontWeight="bold">
        {dato}
      </Table.Cell>

      <Table.Cell>
        <Box
          as="span"
          bg={chipStyle.bg}
          color={chipStyle.color}
          px={2}
          py={1}
          borderRadius="sm"
          fontSize="0.75rem"
          fontWeight="bold"
        >
          {caracter}
        </Box>
      </Table.Cell>

      <Table.Cell color="brand.muted">{finalidad}</Table.Cell>
    </Table.Row>
  );
}
