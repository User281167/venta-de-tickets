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
  IconButton,
} from "@chakra-ui/react";
import { IconEye, IconEyeOff, IconLock } from "@tabler/icons-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { updatePasswordSchema } from "../schemas/auth.schema";
import { updatePassword } from "../api/auth.client";

export function UpdatePasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});
  const [generalError, setGeneralError] = useState("");
  const [status, setStatus] = useState<
    "idle" | "submitting" | "error" | "success"
  >("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");
    setFieldErrors({});

    const result = updatePasswordSchema.safeParse({
      password,
      confirmPassword,
    });

    if (!result.success) {
      const fieldErrors: { password?: string; confirmPassword?: string } = {};
      for (const issue of result.error.issues) {
        const path = issue.path[0];
        if (path === "password" || path === "confirmPassword") {
          fieldErrors[path] = issue.message;
        }
      }
      setFieldErrors(fieldErrors);
      return;
    }

    setStatus("submitting");

    const { success, error } = await updatePassword(result.data.password);

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
          Contraseña actualizada
        </Heading>

        <Text
          textAlign="center"
          fontSize="sm"
          color="white"
          opacity={0.8}
          maxW="sm"
        >
          Tu contraseña se actualizó correctamente. Ya puedes iniciar sesión con
          tu nueva contraseña.
        </Text>

        <Button
          size="lg"
          bg="brand.violet"
          onClick={() => router.push("/login")}
          mt={2}
        >
          Iniciar sesión
        </Button>
      </VStack>
    );
  }

  return (
    <Box mx="auto">
      <VStack gap={5} align="stretch">
        <Stack gap={1}>
          <Heading as="h1" size="xl" textAlign="center" color="white">
            Nueva contraseña
          </Heading>

          <Text textAlign="center" fontSize="sm" color="white" opacity={0.7}>
            Ingresa tu nueva contraseña
          </Text>
        </Stack>

        <form onSubmit={handleSubmit}>
          <Stack gap={4}>
            <Field.Root invalid={!!fieldErrors.password}>
              <Field.Label color="white">Nueva contraseña</Field.Label>
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
                    _hover={{ color: "brand.violet" }}
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
                    aria-label={showPassword ? "Ocultar" : "Mostrar"}
                    variant="ghost"
                    size="xs"
                    color="white"
                    _hover={{ color: "brand.violet" }}
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
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite tu contraseña"
                  color="white"
                  _placeholder={{ color: "rgba(255,255,255,0.5)" }}
                />
              </InputGroup>

              <Field.ErrorText>
                {fieldErrors.confirmPassword}
              </Field.ErrorText>
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
              Actualizar contraseña
            </Button>
          </Stack>
        </form>
      </VStack>
    </Box>
  );
}
