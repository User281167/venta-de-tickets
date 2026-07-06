"use client";

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

import { useRegister } from "../hooks/useRegister";

export function RegisterForm() {
  const router = useRouter();

  const {
    status,
    email,
    setEmail,
    handleSubmit,
    fieldErrors,
    password,
    confirmPassword,
    setConfirmPassword,
    setPassword,
    showPassword,
    setShowPassword,
    consentGiven,
    setConsentGiven,
    generalError,
    googleStatus,
    handleGoogleSignIn,
  } = useRegister();

  if (status === "success") {
    return (
      <VStack gap={5} align="center" py={10}>
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
          Te enviamos un enlace de confirmación a <strong>{email}</strong>. Haz
          clic en el enlace para activar tu cuenta y luego inicia sesión.
        </Text>

        <Button
          variant="outline"
          size="lg"
          colorPalette="white"
          color="white"
          _hover={{
            bg: "rgba(255,255,255,0.2)",
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
            Accede a La Convención
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
              bg="brand.violet"
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
