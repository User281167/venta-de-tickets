import { Box, Container, Heading, List, Table, Text } from "@chakra-ui/react";

export const metadata = {
  title: "Términos y Condiciones — ASE UTP 2026",
  description:
    "Términos y Condiciones del Servicio de la Asociación de Egresados UTP 2026 (ASE UTP).",
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
              Los presentes Términos y Condiciones regulan el acceso, registro
              y uso de la plataforma web oficial de la Asociación de Egresados
              de la Universidad Tecnológica de Pereira (ASE UTP). La plataforma
              ofrece servicios de autenticación, verificación de estatus de
              egresado, adquisición de paquetes de entradas (conciertos,
              charlas de IA, networking y coworking), emisión de entradas
              digitales con código QR, módulo de donaciones y panel de
              auditoría.
            </Text>

            <Text mb={3}>
              La aceptación de estos términos es obligatoria para todo usuario
              registrado, egresado, comprador, donante, administrador o tercero
              que interactúe con la plataforma. El uso continuo del servicio
              implica aceptación implicita de la versión vigente publicada en{" "}
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
        title="2. Registro, Cuenta y Roles de Usuario"
        body={
          <>
            <Text mb={3}>
              Para acceder al servicio, el usuario debe crear una cuenta con
              correo electrónico válido y contraseña. La veracidad de la
              información suministrada es responsabilidad del titular, quien
              deberá mantener actualizados sus datos de contacto.
            </Text>

            <Text mb={3}>
              <strong>Roles habilitados en la plataforma:</strong>
            </Text>
          </>
        }
        table={
          <Table.Root size="sm" variant="line" mt={3} bg="brand.panel">
            <Table.Header>
              <Table.Row bg="brand.blue-dark">
                <Table.ColumnHeader color="brand.light">Rol</Table.ColumnHeader>
                <Table.ColumnHeader color="brand.light">
                  Permisos
                </Table.ColumnHeader>
                <Table.ColumnHeader color="brand.light">
                  Restricciones
                </Table.ColumnHeader>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              <RoleRow
                rol="Usuario"
                permisos="Lectura y edición de datos propios, historial de compras, emisión de entradas QR y donación."
                restricciones="Sin acceso a funciones administrativas ni a la auditoría."
                stripe
              />
              <RoleRow
                rol="Admin"
                permisos="Gestión de precios, cortesías, integraciones de pagos, soporte de Check-in."
                restricciones="Acciones registradas en Audit Log con IP y timestamp inalterables."
              />
              <RoleRow
                rol="Observador"
                permisos="Auditoría exclusiva con permisos de lectura sobre el log inalterable."
                restricciones="Sin permisos de escritura sobre precios, cortesías o datos."
                stripe
              />
            </Table.Body>
          </Table.Root>
        }
        trailing={
          <Box mt={4}>
            <Heading as="h3" fontSize="1rem" color="brand.light" mb={2}>
              Inmutabilidad de Identidad
            </Heading>
            <List.Root pl={5} color="brand.muted">
              <List.Item>
                El campo Cédula de Ciudadanía es de carácter obligatorio y se
                torna <strong>inmutable desde el cliente</strong> tras
                completar el registro. Esta medida previene la suplantación de
                tarifas preferenciales de egresado y garantiza la trazabilidad
                del Check-in en puerta.
              </List.Item>
              <List.Item>
                La rectificación del número de cédula solo se atenderá como
                reclamo formal PQRS a través de los canales institucionales.
              </List.Item>
            </List.Root>
          </Box>
        }
      />

      <Section
        title="3. Compras, Paquetes de Entradas y Pasarelas de Pago"
        body={
          <>
            <Text mb={3}>
              <strong>Denominación Comercial:</strong> La adquisición de
              accesos al evento se denomina formalmente{" "}
              <em>"Paquete de Entradas"</em>, el cual otorga acceso a las
              jornadas académicas, networking y conciertos programados para
              los días 22, 23 y 24 de Octubre de 2026.
            </Text>

            <Text mb={3}>
              <strong>Pasarelas de Pago:</strong> Las transacciones se realizan
              a través de pasarelas certificadas PCI-DSS (ePayco y Mercado
              Pago). La plataforma no almacena datos sensibles de tarjetas
              débito o crédito. Toda operación es procesada y tokenizada por
              el proveedor de pagos, quien notifica la transacción a la
              plataforma mediante Webhooks firmados criptográficamente para su
              contabilización.
            </Text>
          </>
        }
        highlight={
          <Text fontSize="0.9rem">
            <strong style={{ color: "brand.light" }}>Aviso de Seguridad:</strong>{" "}
            Confirma tu transacción solo a través del correo oficial y del
            portal autenticado. La organización no solicita claves, códigos de
            seguridad ni comprobantes de pago por canales no institucionales.
          </Text>
        }
      />

      <Section
        title="4. Derecho de Retracto, Reembolsos y Cancelación"
        body={
          <>
            <Text mb={3}>
              De conformidad con la Ley 1480 de 2011 (Estatuto del Consumidor),
              el comprador podrá ejercer su derecho de retracto dentro de los{" "}
              <strong>cinco (5) días hábiles</strong> siguientes a la fecha de
              la compra del paquete de entradas, siempre y cuando el evento no
              haya tenido lugar dentro de dicho término. La solicitud de
              reembolso debe tramitarse formalmente al correo institucional.
            </Text>

            <Text mb={3}>
              <strong>Procedimiento de Retracto:</strong>
            </Text>

            <List.Root pl={5}>
              <List.Item mb={2}>
                <strong>Solicitud escrita</strong> a{" "}
                egresados@utp.edu.co o aseutp@utp.edu.co, indicando número de
                pedido y motivo.
              </List.Item>
              <List.Item mb={2}>
                <strong>Acreditación de identidad</strong> con documento válido
                del titular de la compra.
              </List.Item>
              <List.Item mb={2}>
                <strong>Reversión del pago</strong> por el mismo medio
                utilizado en un plazo máximo de treinta (30) días calendario
                una vez aprobada la solicitud.
              </List.Item>
              <List.Item>
                <strong>Cancelación del paquete</strong> en la plataforma y
                desactivación del código QR asociado.
              </List.Item>
            </List.Root>
          </>
        }
        highlight={
          <Text fontSize="0.9rem">
            <strong style={{ color: "brand.light" }}>
              Reprogramación o Cancelación por Fuerza Mayor:
            </strong>{" "}
            En caso de modificación substancial en la agenda del evento por
            fuerza mayor o caso fortuito, la organización notificará por correo
            electrónico y WhatsApp oficial las opciones de reasignación o
            devolución aplicables, conforme al equilibrio contractual previsto
            en el Estatuto del Consumidor.
          </Text>
        }
      />

      <Section
        title="5. Módulo de Donaciones y Transparencia"
        body={
          <>
            <Text mb={3}>
              El módulo de donaciones (destinado a la Asociación de Egresados,
              Barranqueros UTP o afectados por sismos) permite la participación
              anónima o registrada, exigiendo de manera obligatoria la
              declaración del origen lícito de fondos mediante el checkbox:{" "}
              <em>
                "Declaro que los recursos entregados en donación provienen de
                una fuente lícita"
              </em>
              .
            </Text>

            <Text mb={3}>
              La donación no confiere derecho a deducciones tributarias
              automáticas salvo que la normativa vigente lo permita y el
              donante cumpla con los requisitos formales requeridos por la
              DIAN. La organización no interviene en la trazabilidad contable
              ni fiscal de las donaciones.
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
              códigos QR, diseños y archivos multimedia) es propiedad de la
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
                Suplantación de identidad de egresados para acceder a
                tarifas preferenciales.
              </List.Item>
              <List.Item mb={2}>
                Manipulación, falsificación o duplicación de códigos QR.
              </List.Item>
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
              <strong>Sanciones:</strong> La organización podrá suspender o
              cancelar cuentas que incurran en conductas prohibidas, sin
              perjuicio de las acciones legales que correspondan conforme a la
              legislación colombiana.
            </Text>
          </>
        }
      />

      <Section
        title="7. Modificaciones, Ley Aplicable y Compliance ISO 27001"
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
                Los 12 Controles de Seguridad (ISO 27001 / MinTIC)
              </Text>

              <List.Root pl={5} color="brand.muted">
                {[
                  "Sistema de Gestión de Seguridad (SGSI) sobre arquitectura redundante en la nube.",
                  "Control de Acceso Basado en Roles (RBAC): Usuario, Admin, Observador.",
                  "Protección de Pasarelas con Webhooks firmados criptográficamente.",
                  "Inmutabilidad del campo Cédula desde el cliente tras el registro.",
                  "Capacitación formal de operadores de Check-in en integridad QR.",
                  "Cortafuegos WAF, mitigación anti-DDoS y redes cifradas en puertas.",
                  "Cifrado HTTPS (TLS 1.3) y enlaces tokenizados transaccionales.",
                  "Hashing seguro de contraseñas (BCrypt / PBKDF2).",
                  "Pruebas continuas contra el OWASP Top 10 en ambientes aislados.",
                  "Auditoría e inalterabilidad (Audit Log) con timestamp, ID e IP.",
                  "Continuidad y contingencia offline en puertas para lectura QR.",
                  "Compliance integral: Leyes 1581, 1266 y 1480; control interno del SGSI.",
                ].map((item, i) => (
                  <List.Item key={i} mb={1}>
                    {item}
                  </List.Item>
                ))}
              </List.Root>
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
          El usuario declara haber leído, comprendido y aceptado en su
          totalidad los presentes Términos y Condiciones al registrarse o
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

function RoleRow({
  rol,
  permisos,
  restricciones,
  stripe,
}: {
  rol: string;
  permisos: string;
  restricciones: string;
  stripe?: boolean;
}) {
  const chipStyle =
    rol === "Admin"
      ? { bg: "utp.azul", color: "brand.blue-dark" }
      : rol === "Observador"
        ? { bg: "utp.naranja", color: "brand.blue-dark" }
        : { bg: "brand.blue-panel", color: "brand.light" };

  return (
    <Table.Row bg={stripe ? "brand.panel" : "transparent"}>
      <Table.Cell color="brand.light" fontWeight="bold">
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
          {rol}
        </Box>
      </Table.Cell>

      <Table.Cell color="brand.light">{permisos}</Table.Cell>
      <Table.Cell color="brand.muted">{restricciones}</Table.Cell>
    </Table.Row>
  );
}
