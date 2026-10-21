"use client";

import { useState, type FormEvent } from "react";
import {
  Box,
  Button,
  Container,
  Heading,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react";
import {
  confirmRegistration,
  findRegistration,
  type RegisterRecord,
} from "../api/registro.client";

export function AdminRegisterPage() {
  const [cedula, setCedula] = useState("");
  const [record, setRecord] = useState<RegisterRecord | null>(null);
  const [searched, setSearched] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function search(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setSearched(false);

    try {
      setRecord(await findRegistration(cedula.trim()));
      setSearched(true);
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : "Error consultando el registro.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function toggleConfirmation() {
    if (!record) return;
    setBusy(true);

    try {
      await confirmRegistration(record.cedula, !record.confirmed);
      setRecord({ ...record, confirmed: !record.confirmed });
    } catch (e) {
      setMessage(
        e instanceof Error
          ? e.message
          : "No se pudo actualizar la confirmación.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <Container maxW="2xl" py={{ base: 16, md: 20 }}>
      <Box className="glass-card" p={{ base: 7, md: 9 }}>
        <Heading color="white" mb={8}>
          Validar registro
        </Heading>

        <form onSubmit={search}>
          <Stack direction={{ base: "column", sm: "row" }} gap={4}>
            <Input
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              placeholder="Número de cédula"
              color="white"
              required
            />

            <Button
              type="submit"
              loading={busy}
              bg="brand.violet"
              color="white"
              _hover={{ bg: "#6a2be2" }}
            >
              Consultar
            </Button>
          </Stack>
        </form>

        {message && (
          <Text role="alert" color="red.300" mt={4}>
            {message}
          </Text>
        )}

        {searched && !record && (
          <Text color="brand.muted" mt={5}>
            No existe un registro con esa cédula.
          </Text>
        )}

        {record && (
          <Stack mt={6} gap={3} color="white">
            <Text>
              <b>Nombre:</b> {record.name}
            </Text>
            <Text>
              <b>Cédula:</b> {record.cedula}
            </Text>
            <Text>
              <b>Correo:</b> {record.email}
            </Text>
            <Text>
              <b>Celular:</b> {record.phone}
            </Text>
            <Text>
              <b>Estamento / profesión:</b> {record.profesion}
            </Text>
            <Text>
              <b>Egresado:</b> {record.isEgresado ? "Sí" : "No"}
            </Text>
            <Text>
              <b>Ingreso:</b> {record.confirmed ? "Confirmado" : "Pendiente"}
            </Text>

            <Button
              onClick={toggleConfirmation}
              loading={busy}
              bg="brand.violet"
              color="white"
              _hover={{ bg: "#6a2be2" }}
            >
              {record.confirmed ? "Quitar confirmación" : "Confirmar ingreso"}
            </Button>
          </Stack>
        )}
      </Box>
    </Container>
  );
}
