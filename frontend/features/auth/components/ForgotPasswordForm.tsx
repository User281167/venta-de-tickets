"use client";

import {
  Box,
  Button,
  Field,
  Input,
  InputGroup,
  Stack,
  Text,
  Heading,
  VStack,
} from "@chakra-ui/react";
import { IconMail } from "@tabler/icons-react";
import { useState } from "react";
import { forgotPasswordSchema } from "../schemas/auth.schema";
import { resetPasswordForEmail } from "../api/auth.client";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string }>({});
  const [generalError, setGeneralError] = useState("");
  const [status, setStatus] = useState<
    "idle" | "submitting" | "error" | "success"
  >("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");
    setFieldErrors({});

    const result = forgotPasswordSchema.safeParse({ email });

    if (!result.success) {
      const fieldErrors: { email?: string } = {};

      for (const issue of result.error.issues) {
        const path = issue.path[0];

        if (path === "email") fieldErrors.email = issue.message;
      }

      setFieldErrors(fieldErrors);
      return;
    }

    setStatus("submitting");

    const { success, error } = await resetPasswordForEmail(email);

    if (!success) {
      setGeneralError(error);
      setStatus("error");
      return;
    }

    setStatus("success");
  };

  if (status === "success") {
    return (
      <VStack gap={5} align="center" py={6}>
        <Heading as="h1" size="xl" textAlign="center" color="white">
          Revisa tu correo
        </Heading>

        <Text
          textAlign="center"
          fontSize="sm"
          color="white"
          opacity={0.8}
          maxW="sm"
        >
          Si <strong>{email}</strong> está registrado, te enviamos un enlace
          para restablecer tu contraseña. Revisa tu bandeja de entrada.
        </Text>
      </VStack>
    );
  }

  return (
    <Box mx="auto">
      <VStack gap={5} align="stretch">
        <Stack gap={1}>
          <Heading as="h1" size="xl" textAlign="center" color="white">
            Recuperar contraseña
          </Heading>

          <Text textAlign="center" fontSize="sm" color="white" opacity={0.7}>
            Te enviaremos un enlace para restablecerla
          </Text>
        </Stack>

        <form onSubmit={handleSubmit}>
          <Stack gap={4}>
            <Field.Root invalid={!!fieldErrors.email}>
              <Field.Label color="white">Correo electrónico</Field.Label>

              <InputGroup
                startElement={
                  <IconMail size={18} color="rgba(255,255,255,0.6)" />
                }
              >
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  color="white"
                  _placeholder={{ color: "rgba(255,255,255,0.5)" }}
                />
              </InputGroup>

              <Field.ErrorText>{fieldErrors.email}</Field.ErrorText>
            </Field.Root>

            {generalError && (
              <Text color="#FF5722" fontSize="sm" textAlign="center">
                {generalError}
              </Text>
            )}

            <Button
              type="submit"
              loading={status === "submitting"}
              w="full"
              size="lg"
              bg="brand.violet"
            >
              Enviar enlace
            </Button>
          </Stack>
        </form>
      </VStack>
    </Box>
  );
}
