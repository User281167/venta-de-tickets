"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Box,
  Button,
  Checkbox,
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
} from "@chakra-ui/react";
import {
  IconBrandGoogle,
  IconEye,
  IconEyeOff,
  IconMail,
  IconLock,
} from "@tabler/icons-react";

import {
  registerSchema,
  type RegisterInput,
} from "@/features/auth/schemas/auth.schema";
import { signUp, signInWithGoogle } from "@/features/auth/api/auth.client";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function RegisterForm() {
  const router = useRouter();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof RegisterInput, string>>
  >({});
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

    const result = registerSchema.safeParse({
      email,
      password,
      confirmPassword,
      consentGiven,
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
  }

  async function handleGoogleSignIn() {
    setGoogleStatus("loading");
    await signInWithGoogle();
  }

  if (status === "success") {
    return (
      <VStack gap={5} align="center" py={10}>
        <Heading as="h1" size="xl" textAlign="center" color="white">
          Revisa tu correo
        </Heading>

        <Text textAlign="center" fontSize="sm" color="white" opacity={0.8} maxW="sm">
          Te enviamos un enlace de confirmación a{" "}
          <strong>{email}</strong>. Haz clic en el enlace para activar tu
          cuenta y luego inicia sesión.
        </Text>

        <Button
          variant="outline"
          size="lg"
          colorPalette="white"
          color="white"
          _hover={{
            color: "transparent"
          }}
          onClick={() => router.push("/login")}
          mt={4}
        >
          Ir a iniciar sesión
        </Button>
      </VStack>
    );
  }

  return (
    <Box mx="auto">
      <VStack gap={5} align="stretch">
        <Stack gap={1}>
          <Heading as="h1" size="xl" textAlign="center" color="white">
            Crear cuenta
          </Heading>

          <Text textAlign="center" fontSize="sm" color="white" opacity={0.7}>
            Accede a Future Minds 2026
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

            <Field.Root invalid={!!fieldErrors.password}>
              <Field.Label color="white">Contraseña</Field.Label>
              <InputGroup
                startElement={
                  <IconLock size={18} color="rgba(255,255,255,0.6)" />
                }
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
                  placeholder="Mínimo 8 caracteres"
                  color="white"
                  _placeholder={{ color: "rgba(255,255,255,0.5)" }}
                />
              </InputGroup>
              <Field.ErrorText>{fieldErrors.password}</Field.ErrorText>
            </Field.Root>

            <Field.Root invalid={!!fieldErrors.confirmPassword}>
              <Field.Label color="white">Confirmar contraseña</Field.Label>
              <InputGroup
                startElement={
                  <IconLock size={18} color="rgba(255,255,255,0.6)" />
                }
                endElement={
                  <IconButton
                    aria-label={showConfirmPassword ? "Ocultar" : "Mostrar"}
                    variant="ghost"
                    size="xs"
                    color="white"
                    _hover={{ color: "brand.teal" }}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <IconEyeOff size={18} />
                    ) : (
                      <IconEye size={18} />
                    )}
                  </IconButton>
                }
              >
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite tu contraseña"
                  color="white"
                  _placeholder={{ color: "rgba(255,255,255,0.5)" }}
                />
              </InputGroup>
              <Field.ErrorText>{fieldErrors.confirmPassword}</Field.ErrorText>
            </Field.Root>

            <Field.Root invalid={!!fieldErrors.consentGiven}>
              <HStack gap={3} align="flex-start">
                <Checkbox.Root
                  checked={consentGiven}
                  onCheckedChange={(details) =>
                    setConsentGiven(!!details.checked)
                  }
                >
                  <Checkbox.HiddenInput />

                  <Checkbox.Control
                    borderColor="rgba(255,255,255,0.5)"
                    _checked={{ bg: "teal.500", borderColor: "teal.500" }}
                  />
                </Checkbox.Root>

                <Text as="span" color="white" fontSize="sm" lineHeight="1.5">
                  Acepto los{" "}
                  <Link
                    href="/terminos"
                    style={{ textDecoration: "underline", color: "#81E6D9" }}
                  >
                    términos y condiciones
                  </Link>{" "}
                  y la{" "}
                  <Link
                    href="/privacidad"
                    style={{ textDecoration: "underline", color: "#81E6D9" }}
                  >
                    política de privacidad
                  </Link>
                </Text>
              </HStack>

              <Field.ErrorText>{fieldErrors.consentGiven}</Field.ErrorText>
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
              Registrarse
            </Button>
          </Stack>
        </form>

        <HStack gap={4}>
          <Separator flex={1} />

          <Text fontSize="xs" color="gray.400" flexShrink={0}>
            o regístrate con
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
      </VStack>
    </Box>
  );
}
