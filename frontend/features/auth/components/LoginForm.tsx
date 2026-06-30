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
  Separator,
} from "@chakra-ui/react";
import { loginSchema } from "@/features/auth/schemas/auth.schema";
import {
  signInWithPassword,
  signInWithGoogle,
} from "@/features/auth/api/auth.client";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function LoginForm() {
  const router = useRouter();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [generalError, setGeneralError] = useState("");
  const [status, setStatus] = useState<
    "idle" | "submitting" | "error" | "success"
  >("idle");
  const [googleStatus, setGoogleStatus] = useState<"idle" | "loading">("idle");

  if (user) {
    router.push("/");
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGeneralError("");
    setFieldErrors({});

    const result = loginSchema.safeParse({ email, password });

    if (!result.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      for (const issue of result.error.issues) {
        const path = issue.path[0] as "email" | "password";
        fieldErrors[path] = issue.message;
      }
      setFieldErrors(fieldErrors);
      return;
    }

    setStatus("submitting");

    const { success, error } = await signInWithPassword(email, password);

    if (!success) {
      setGeneralError(error);
      setStatus("error");
      return;
    }

    setStatus("success");
    router.push("/");
  }

  async function handleGoogleSignIn() {
    setGoogleStatus("loading");
    await signInWithGoogle();
  }

  return (
    <Box maxW="md" mx="auto" mt={10} p={6}>
      <VStack gap={6} align="stretch">
        <Heading as="h1" size="xl" textAlign="center">
          Iniciar sesión
        </Heading>

        <form onSubmit={handleSubmit}>
          <Stack gap={4}>
            <Field.Root invalid={!!fieldErrors.email}>
              <Field.Label color="brand.dark">
                Correo electrónico
              </Field.Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
              />
              <Field.ErrorText>{fieldErrors.email}</Field.ErrorText>
            </Field.Root>

            <Field.Root invalid={!!fieldErrors.password}>
              <Field.Label color="brand.dark">Contraseña</Field.Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tu contraseña"
              />
              <Field.ErrorText>{fieldErrors.password}</Field.ErrorText>
            </Field.Root>

            {generalError && (
              <Text color="brand.orange" fontSize="sm" textAlign="center">
                {generalError}
              </Text>
            )}

            <Button type="submit" loading={status === "submitting"} w="full" colorPalette="teal">
              Iniciar sesión
            </Button>
          </Stack>
        </form>

        <Separator />

        <Button
          variant="outline"
          w="full"
          loading={googleStatus === "loading"}
          onClick={handleGoogleSignIn}
        >
          Continuar con Google
        </Button>
      </VStack>
    </Box>
  );
}
