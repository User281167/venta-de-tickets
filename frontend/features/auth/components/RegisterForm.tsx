"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Field,
  Input,
  Stack,
  Text,
  Heading,
  VStack,
} from "@chakra-ui/react";
import {
  registerSchema,
  type RegisterInput,
} from "@/features/auth/schemas/auth.schema";
import { signUp } from "@/features/auth/api/auth.client";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function RegisterForm() {
  const router = useRouter();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof RegisterInput, string>>
  >({});
  const [generalError, setGeneralError] = useState("");
  const [status, setStatus] = useState<
    "idle" | "submitting" | "error" | "success"
  >("idle");

  if (user) {
    router.push("/");
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGeneralError("");
    setFieldErrors({});

    const result = registerSchema.safeParse({
      email,
      password,
      confirmPassword,
    });

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof RegisterInput, string>> = {};
      for (const issue of result.error.issues) {
        const path = issue.path[0] as keyof RegisterInput;
        fieldErrors[path] = issue.message;
      }
      setFieldErrors(fieldErrors);
      return;
    }

    setStatus("submitting");

    const { success, error } = await signUp(email, password);

    if (!success) {
      setGeneralError(error);
      setStatus("error");
      return;
    }

    setStatus("success");
    router.push("/");
  }

  return (
    <Box maxW="md" mx="auto" mt={10} p={6}>
      <VStack gap={6} align="stretch">
        <Heading as="h1" size="xl" textAlign="center">
          Crear cuenta
        </Heading>

        <form onSubmit={handleSubmit}>
          <Stack gap={4}>
            <Field.Root invalid={!!fieldErrors.email}>
              <Field.Label>Correo electrónico</Field.Label>

              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
              />
              <Field.ErrorText>{fieldErrors.email}</Field.ErrorText>
            </Field.Root>

            <Field.Root invalid={!!fieldErrors.password}>
              <Field.Label>Contraseña</Field.Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
              />
              <Field.ErrorText>{fieldErrors.password}</Field.ErrorText>
            </Field.Root>

            <Field.Root invalid={!!fieldErrors.confirmPassword}>
              <Field.Label>Confirmar contraseña</Field.Label>

              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite tu contraseña"
              />

              <Field.ErrorText>{fieldErrors.confirmPassword}</Field.ErrorText>
            </Field.Root>

            {generalError && (
              <Text color="brand.orange" fontSize="sm" textAlign="center">
                {generalError}
              </Text>
            )}

            <Button
              type="submit"
              loading={status === "submitting"}
              w="full"
              colorPalette="teal"
            >
              Registrarse
            </Button>
          </Stack>
        </form>
      </VStack>
    </Box>
  );
}
