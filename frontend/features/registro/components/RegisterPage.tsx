"use client";

import { useState, type FormEvent } from "react";
import {
  Box,
  Button,
  Container,
  Field,
  Heading,
  Input,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { submitRegistration, type RegisterInput } from "../api/registro.client";

const initial: RegisterInput = {
  name: "",
  cedula: "",
  email: "",
  phone: "",
  profesion: "",
};

const PROFESSION_OPTIONS = [
  "Estudiante",
  "Docente/profesor",
  "Administrativo UTP",
  "Egresado",
  "Contratista/aliado",
] as const;

export function RegisterPage() {
  const [values, setValues] = useState(initial);
  const [professionChoice, setProfessionChoice] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (!/^\d{8,15}$/.test(values.cedula))
      return setError("Ingresa una cédula de 8 a 15 dígitos.");

    if (!values.profesion.trim())
      return setError("Selecciona tu estamento o escribe tu profesión.");

    setBusy(true);

    try {
      await submitRegistration(values);
      setDone(true);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No se pudo completar el registro.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (done)
    return (
      <Container maxW="lg" py={20}>
        <Box className="glass-card" p={8} textAlign="center">
          <Heading color="white">¡Gracias por registrarte!</Heading>
          <Text color="brand.muted" mt={4}>
            Te esperamos en la Convención de Egresados UTP.
          </Text>

          <Button asChild mt={6}>
            <NextLink href="/">Volver al inicio</NextLink>
          </Button>
        </Box>
      </Container>
    );

  return (
    <Container maxW="lg" py={{ base: 10, md: 16 }}>
      <Box className="glass-card" p={{ base: 6, md: 8 }}>
        <Heading color="white">Registro a la Convención</Heading>
        <Text color="brand.muted" mt={2} mb={6}>
          Completa tus datos para registrarte y entrar al evento.
        </Text>

        <form onSubmit={onSubmit}>
          <Stack gap={4}>
            {(
              [
                ["name", "Nombre completo", "text"],
                ["cedula", "Cédula", "text"],
                ["email", "Correo electrónico", "email"],
                ["phone", "Celular", "tel"],
              ] as const
            ).map(([key, label, type]) => (
              <Field.Root key={key} required>
                <Field.Label color="white">{label}</Field.Label>

                <Input
                  required
                  name={key}
                  type={type}
                  value={values[key]}
                  onChange={(e) =>
                    setValues({ ...values, [key]: e.target.value })
                  }
                  color="white"
                />
              </Field.Root>
            ))}

            <Field.Root required>
              <Field.Label color="white">Estamento / profesión</Field.Label>
              <select
                required
                name="professionChoice"
                value={professionChoice}
                onChange={(event) => {
                  const choice = event.target.value;
                  setProfessionChoice(choice);
                  setValues({
                    ...values,
                    profesion: choice === "Otro" ? "" : choice,
                  });
                }}
                style={{
                  width: "100%",
                  minHeight: "40px",
                  padding: "0 12px",
                  borderRadius: "8px",
                  color: "white",
                  background: "#171923",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                <option value="" disabled>
                  Selecciona una opción
                </option>

                {PROFESSION_OPTIONS.map((profession) => (
                  <option key={profession} value={profession}>
                    {profession}
                  </option>
                ))}
                <option value="Otro">Otro</option>
              </select>
            </Field.Root>

            {professionChoice === "Otro" && (
              <Field.Root required>
                <Field.Label color="white">Escribe tu profesión</Field.Label>

                <Input
                  required
                  name="profesion"
                  value={values.profesion}
                  onChange={(event) =>
                    setValues({ ...values, profesion: event.target.value })
                  }
                  placeholder="Tu profesión o estamento"
                  color="white"
                />
              </Field.Root>
            )}

            {error && (
              <Text role="alert" color="red.300">
                {error}
              </Text>
            )}

            <Button type="submit" loading={busy} colorPalette="teal">
              Registrarme
            </Button>

            <Text color="brand.muted" textAlign="center">
              También puedes{" "}
              <Link asChild color="cyan.300">
                <NextLink
                  href="/donar"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  apoyar a UTPtón
                </NextLink>
              </Link>
              .
            </Text>
          </Stack>
        </form>
      </Box>
    </Container>
  );
}
