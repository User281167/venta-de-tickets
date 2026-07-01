"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Field,
  HStack,
  Input,
  InputGroup,
  Stack,
  Text,
  Heading,
  VStack,
  Separator,
  IconButton,
  chakra,
} from "@chakra-ui/react";
import { loginSchema } from "@/features/auth/schemas/auth.schema";
import {
  signInWithPassword,
  signInWithGoogle,
} from "@/features/auth/api/auth.client";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { createClient } from "@/shared/lib/supabase/client";
import { submitOnboardingSurvey } from "@/features/surveys/api/endpoints/surveys.endpoints";
import { toaster } from "@/components/ui/toaster";
import {
  IconBrandGoogle,
  IconEye,
  IconEyeOff,
  IconMail,
  IconLock,
  IconPlayerSkipForward,
} from "@tabler/icons-react";

export function LoginForm() {
  const router = useRouter();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [generalError, setGeneralError] = useState("");
  const [status, setStatus] = useState<
    "idle" | "submitting" | "error" | "success"
  >("idle");
  const [googleStatus, setGoogleStatus] = useState<"idle" | "loading">("idle");
  const [skipLoading, setSkipLoading] = useState(false);

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

  async function handleSkipSurvey() {
    setSkipLoading(true);
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      toaster.create({
        title: "Inicia sesión primero",
        description: "Debes iniciar sesión para omitir la encuesta.",
        type: "info",
      });
      setSkipLoading(false);
      return;
    }

    try {
      await submitOnboardingSurvey({ responses: [] });
      toaster.create({
        title: "Encuesta omitida",
        description: "Puedes completarla después desde tu perfil.",
        type: "success",
      });
      router.push("/");
    } catch {
      toaster.create({
        title: "Error",
        description: "No se pudo omitir la encuesta. Intenta de nuevo.",
        type: "error",
      });
    } finally {
      setSkipLoading(false);
    }
  }

  return (
    <Box mx="auto">
      <VStack gap={5} align="stretch">
        <Stack gap={1}>
          <Heading as="h1" size="xl" textAlign="center" color="white">
            Iniciar sesión
          </Heading>

          <Text textAlign="center" fontSize="sm" color="white" opacity={0.7}>
            Ingresa a tu cuenta para continuar
          </Text>
        </Stack>

        <form onSubmit={handleSubmit}>
          <Stack gap={4}>
            <Field.Root invalid={!!fieldErrors.email}>
              <Field.Label color="white">Correo electrónico</Field.Label>
              <InputGroup startElement={<IconMail size={18} color="rgba(255,255,255,0.6)" />}>
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

            <Field.Root invalid={!!fieldErrors.password}>
              <Field.Label color="white">Contraseña</Field.Label>
              <InputGroup
                startElement={<IconLock size={18} color="rgba(255,255,255,0.6)" />}
                endElement={
                  <IconButton
                    aria-label={showPassword ? "Ocultar" : "Mostrar"}
                    variant="ghost"
                    size="xs"
                    color="white"
                    _hover={{ color: "brand.teal" }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <IconEyeOff size={18} />
                    ) : (
                      <IconEye size={18} />
                    )}
                  </IconButton>
                }
              >
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tu contraseña"
                  color="white"
                  _placeholder={{ color: "rgba(255,255,255,0.5)" }}
                />
              </InputGroup>
              <Field.ErrorText>{fieldErrors.password}</Field.ErrorText>
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
              colorPalette="teal"
            >
              Iniciar sesión
            </Button>
          </Stack>
        </form>

        <HStack gap={4}>
          <Separator flex={1} />

          <Text fontSize="xs" color="gray.400" flexShrink={0}>
            o continúa con
          </Text>

          <Separator flex={1} />
        </HStack>

        <Button
          variant="outline"
          w="full"
          size="lg"
          loading={googleStatus === "loading"}
          onClick={handleGoogleSignIn}
          color="white"
          borderColor="rgba(255,255,255,0.4)"
          _hover={{ bg: "rgba(255,255,255,0.1)" }}
        >
          <IconBrandGoogle size={20} />
          Google
        </Button>

        <Box textAlign="center" pt={1}>
          <chakra.button
            onClick={handleSkipSurvey}
            disabled={skipLoading}
            opacity={skipLoading ? 0.6 : 0.6}
            _hover={{ opacity: 1, color: "white" }}
            transition="all 0.2s"
            fontSize="xs"
            color="gray.400"
            cursor="pointer"
            bg="transparent"
            border="none"
            display="inline-flex"
            alignItems="center"
            gap={1}
            type="button"
          >
            <IconPlayerSkipForward size={12} />
            Omitir encuesta de bienvenida
          </chakra.button>
        </Box>
      </VStack>
    </Box>
  );
}
