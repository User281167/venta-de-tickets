"use client";

import {
  Box,
  Button,
  Field,
  Flex,
  Grid,
  Heading,
  HStack,
  Input,
  Skeleton,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  IconCalendar,
  IconHome,
  IconId,
  IconMail,
  IconPhone,
  IconUser,
} from "@tabler/icons-react";
import { useState } from "react";
import { toast } from "sonner";
import { motion, useReducedMotion } from "framer-motion";
import { useMe, useUpdateMe } from "../hooks/useProfile";
import type { UpdateUserInput } from "../schemas/users.schema";
import { updateUserSchema } from "../schemas/users.schema";
import { ApiError } from "../api/users.client";

const FIELDS: {
  key: keyof UpdateUserInput;
  label: string;
  icon: typeof IconUser;
  type?: string;
  placeholder?: string;
}[] = [
  {
    key: "fullName",
    label: "Nombre completo",
    icon: IconUser,
    placeholder: "Tu nombre completo",
  },
  {
    key: "cedula",
    label: "Cédula",
    icon: IconId,
    placeholder: "Número de cédula",
  },
  {
    key: "phone",
    label: "Teléfono",
    icon: IconPhone,
    placeholder: "Teléfono de contacto",
  },
  {
    key: "address",
    label: "Dirección",
    icon: IconHome,
    placeholder: "Dirección de residencia",
  },
  {
    key: "dateOfBirth",
    label: "Fecha de nacimiento",
    icon: IconCalendar,
    type: "date",
  },
];

function InfoRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof IconUser;
}) {
  return (
    <HStack gap={4} py={3} borderBottom="1px solid rgba(255,255,255,0.06)">
      <Flex
        w={10}
        h={10}
        borderRadius="xl"
        bg="rgba(0,229,255,0.08)"
        border="1px solid rgba(0,229,255,0.16)"
        align="center"
        justify="center"
        flexShrink={0}
      >
        <Icon size={20} color="#00e5ff" />
      </Flex>
      <Stack gap={0}>
        <Text
          fontSize="xs"
          color="brand.muted"
          textTransform="uppercase"
          letterSpacing="0.08em"
        >
          {label}
        </Text>
        <Text color="white" fontWeight="medium">
          {value || (
            <Text as="span" color="brand.muted" fontStyle="italic">
              No registrado
            </Text>
          )}
        </Text>
      </Stack>
    </HStack>
  );
}

export function ProfileForm() {
  const { data, isLoading } = useMe();
  const { mutate: doUpdate, isPending } = useUpdateMe();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<UpdateUserInput>({
    fullName: "",
    phone: "",
    cedula: "",
    address: "",
    dateOfBirth: "",
  });
  const [error, setError] = useState<string | null>(null);
  const reduced = useReducedMotion();

  if (isLoading || !data) {
    return (
      <Box maxW="3xl" mx="auto" p={6}>
        <VStack gap={6} align="stretch">
          <Skeleton height="28px" width="160px" />
          <Skeleton height="120px" width="full" borderRadius="2xl" />
          <Skeleton height="40px" width="full" />
          <Skeleton height="40px" width="full" />
          <Skeleton height="40px" width="full" />
        </VStack>
      </Box>
    );
  }

  const { user, consentStatus } = data;
  const completedCount = [
    user.fullName,
    user.phone,
    user.cedula,
    user.address,
    user.dateOfBirth,
  ].filter(Boolean).length;
  const completionPercent = Math.round((completedCount / 5) * 100);

  const startEdit = () => {
    setForm({
      fullName: user.fullName ?? "",
      phone: user.phone ?? "",
      cedula: user.cedula ?? "",
      address: user.address ?? "",
      dateOfBirth: user.dateOfBirth ?? "",
    });
    setError(null);
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setError(null);
  };

  const saveEdit = () => {
    const parsed = updateUserSchema.safeParse(form);

    if (!parsed.success) {
      const msg = parsed.error.issues.map((i) => i.message).join(", ");
      setError(msg);
      toast.error("Error de validación", { description: msg });
      return;
    }

    setError(null);
    doUpdate(parsed.data, {
      onSuccess: () => {
        setEditing(false);
        toast.success("Información actualizada", {
          description: "Tus datos se han guardado correctamente",
        });
      },
      onError: (err: Error) => {
        const description =
          err instanceof ApiError
            ? `${err.message} (${err.code})`
            : err.message || "No se pudo guardar la información";
        toast.error("Error al actualizar", { description });
      },
    });
  };

  return (
    <Box maxW="3xl" mx="auto">
      <VStack gap={8} align="stretch">
        <motion.div
          initial={reduced ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Stack gap={1}>
            <Heading as="h1" size="2xl" color="white">
              Información personal
            </Heading>
            <Text color="brand.muted">
              Gestiona tus datos de contacto y revisa el estado de tu perfil.
            </Text>
          </Stack>
        </motion.div>

        <motion.div
          initial={reduced ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Box
            className="glass-card"
            borderRadius="2xl"
            p={{ base: 5, md: 7 }}
            position="relative"
            overflow="hidden"
          >
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              h="4px"
              bg="linear-gradient(90deg, #ff0f7b, #00e5ff)"
            />

            <Stack
              direction={{ base: "column", sm: "row" }}
              gap={6}
              align={{ base: "center", sm: "flex-start" }}
              textAlign={{ base: "center", sm: "left" }}
            >
              <Flex
                w={20}
                h={20}
                borderRadius="full"
                bg="linear-gradient(135deg, #ff0f7b, #7c3cff)"
                align="center"
                justify="center"
                boxShadow="0 0 32px rgba(255,15,123,0.35)"
                flexShrink={0}
              >
                <Text fontSize="3xl" fontWeight="black" color="white">
                  {(user.fullName ?? user.email).charAt(0).toUpperCase()}
                </Text>
              </Flex>

              <Stack gap={1} flex={1}>
                <Text fontSize="2xl" fontWeight="bold" color="white">
                  {user.fullName || "Completa tu nombre"}
                </Text>
                <HStack
                  gap={2}
                  justify={{ base: "center", sm: "flex-start" }}
                  color="brand.muted"
                >
                  <IconMail size={18} />
                  <Text>{user.email}</Text>
                </HStack>
              </Stack>

              <Box
                px={4}
                py={3}
                borderRadius="xl"
                bg="rgba(255,255,255,0.04)"
                border="1px solid rgba(255,255,255,0.08)"
                textAlign="center"
                minW="120px"
              >
                <Text
                  fontSize="2xl"
                  fontWeight="black"
                  className="gradient-text"
                >
                  {completionPercent}%
                </Text>
                <Text fontSize="xs" color="brand.muted">
                  Perfil completado
                </Text>
              </Box>
            </Stack>
          </Box>
        </motion.div>

        <motion.div
          initial={reduced ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Box
            className="glass-card"
            borderRadius="2xl"
            p={{ base: 5, md: 7 }}
            position="relative"
            overflow="hidden"
          >
            <HStack
              justify="space-between"
              align="center"
              mb={6}
              flexWrap="wrap"
              gap={3}
            >
              <Heading as="h2" size="lg" color="white">
                Detalles del perfil
              </Heading>

              {!editing && (
                <Button
                  bg="brand.violet"
                  color="white"
                  fontWeight="bold"
                  borderRadius="xl"
                  px={6}
                  _hover={{ bg: "#6a2be2", transform: "translateY(-2px)" }}
                  transition="all 0.2s ease"
                  onClick={startEdit}
                >
                  Editar información
                </Button>
              )}
            </HStack>

            <motion.div
              initial={false}
              animate={{
                height: editing ? "auto" : 0,
                opacity: editing ? 1 : 0,
              }}
              transition={{ duration: reduced ? 0 : 0.3, ease: "easeInOut" }}
              style={{ overflow: "hidden" }}
            >
              <Grid
                templateColumns={{ base: "1fr", md: "1fr 1fr" }}
                gap={5}
                mb={6}
              >
                {FIELDS.map((field) => {
                  const Icon = field.icon;
                  const value = form[field.key] ?? "";
                  const isCedulaLocked =
                    field.key === "cedula" && !!user.cedula;

                  return (
                    <Field.Root key={field.key} disabled={isCedulaLocked}>
                      <Field.Label color="brand.muted">
                        <HStack gap={2}>
                          <Icon size={16} color="#00e5ff" />
                          <Text>{field.label}</Text>
                        </HStack>
                      </Field.Label>
                      <Input
                        type={field.type ?? "text"}
                        placeholder={field.placeholder}
                        value={value}
                        disabled={isCedulaLocked}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            [field.key]:
                              e.target.value === "" ? null : e.target.value,
                          }))
                        }
                        bg="rgba(255,255,255,0.03)"
                        border="1px solid rgba(255,255,255,0.08)"
                        borderRadius="xl"
                        color="white"
                        _hover={{ borderColor: "rgba(255,255,255,0.16)" }}
                        _focus={{
                          borderColor: "brand.cyan",
                          boxShadow: "0 0 12px rgba(0,229,255,0.2)",
                        }}
                      />
                      {isCedulaLocked && (
                        <Field.HelperText color="brand.muted" fontSize="xs">
                          La cédula no puede modificarse una vez establecida.
                        </Field.HelperText>
                      )}
                    </Field.Root>
                  );
                })}
              </Grid>

              {error && (
                <Text color="red.400" fontSize="sm" mb={4}>
                  {error}
                </Text>
              )}

              <HStack gap={4} justify="flex-end">
                <Button
                  variant="outline"
                  color="white"
                  _hover={{ color: "black" }}
                  borderColor="rgba(255,255,255,0.16)"
                  borderRadius="xl"
                  onClick={cancelEdit}
                >
                  Cancelar
                </Button>
                <Button
                  bg="brand.violet"
                  color="white"
                  fontWeight="bold"
                  borderRadius="xl"
                  loading={isPending}
                  onClick={saveEdit}
                  _hover={{ bg: "#6a2be2", transform: "translateY(-2px)" }}
                  transition="all 0.2s ease"
                >
                  Guardar cambios
                </Button>
              </HStack>
            </motion.div>

            <motion.div
              initial={false}
              animate={{
                height: editing ? 0 : "auto",
                opacity: editing ? 0 : 1,
              }}
              transition={{ duration: reduced ? 0 : 0.3, ease: "easeInOut" }}
              style={{ overflow: "hidden" }}
            >
              <VStack align="stretch" gap={0}>
                <InfoRow
                  label="Correo electrónico"
                  value={user.email}
                  icon={IconMail}
                />
                <InfoRow
                  label="Cédula"
                  value={user.cedula ?? ""}
                  icon={IconId}
                />
                <InfoRow
                  label="Nombre completo"
                  value={user.fullName ?? ""}
                  icon={IconUser}
                />
                <InfoRow
                  label="Teléfono"
                  value={user.phone ?? ""}
                  icon={IconPhone}
                />
                <InfoRow
                  label="Dirección"
                  value={user.address ?? ""}
                  icon={IconHome}
                />
                <InfoRow
                  label="Fecha de nacimiento"
                  value={
                    user.dateOfBirth
                      ? new Date(user.dateOfBirth).toLocaleDateString("es-CO")
                      : ""
                  }
                  icon={IconCalendar}
                />
              </VStack>
            </motion.div>
          </Box>
        </motion.div>

        {consentStatus?.acceptedAt && (
          <motion.div
            initial={reduced ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Box
              borderRadius="xl"
              border="1px solid rgba(255,255,255,0.08)"
              bg="rgba(255,255,255,0.02)"
              p={5}
            >
              <Text fontSize="sm" color="brand.muted">
                Consentimiento de privacidad aceptado el{" "}
                <Text as="span" color="white" fontWeight="medium">
                  {new Date(consentStatus.acceptedAt).toLocaleDateString(
                    "es-CO",
                  )}
                </Text>
              </Text>
              <Text fontSize="xs" color="brand.muted" mt={1}>
                Versión: {consentStatus.policyVersion}
              </Text>
            </Box>
          </motion.div>
        )}
      </VStack>
    </Box>
  );
}
