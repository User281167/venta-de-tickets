"use client";

import { Heading, Table, Text, VStack } from "@chakra-ui/react";
import { useSurveys } from "@/features/admin-surveys/api/admin-surveys.queries";

export function SurveyResponsesTable() {
  const { data, isLoading, isError } = useSurveys();

  if (isLoading) {
    return <Text>Cargando...</Text>;
  }

  if (isError) {
    return (
      <Text color="red.500">
        Error al cargar respuestas. Verifica tus permisos.
      </Text>
    );
  }

  return (
    <VStack align="stretch" gap={4}>
      <Heading as="h1" size="lg">
        Encuestas de incorporación
      </Heading>

      {!data || data.data.length === 0 ? (
        <Text color="gray.500">No hay respuestas de encuesta todavía.</Text>
      ) : (
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Usuario</Table.ColumnHeader>
              <Table.ColumnHeader>Correo</Table.ColumnHeader>
              <Table.ColumnHeader>Respuestas</Table.ColumnHeader>
              <Table.ColumnHeader>Enviado</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {data.data.map((response) => (
              <Table.Row key={response.userId}>
                <Table.Cell>{response.userName ?? "—"}</Table.Cell>
                <Table.Cell>{response.userEmail ?? "—"}</Table.Cell>
                <Table.Cell>
                  <pre style={{ fontSize: "0.8rem", whiteSpace: "pre-wrap" }}>
                    {JSON.stringify(response.answers, null, 1)}
                  </pre>
                </Table.Cell>
                <Table.Cell>
                  {new Date(response.submittedAt).toLocaleDateString("es-CO")}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      )}
    </VStack>
  );
}
