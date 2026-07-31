"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Button,
  DialogBackdrop,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogPositioner,
  DialogRoot,
  DialogTitle,
  Field,
  HStack,
  Input,
  InputGroup,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { IconArrowLeft, IconId, IconUser } from "@tabler/icons-react";
import { toast } from "sonner";
import { useAuth } from "@/providers/AuthProvider";
import { useMe, useUpdateMe } from "@/features/users/hooks/useProfile";
import { updateUserSchema } from "@/features/users/schemas/users.schema";
import { formatApiError } from "@/shared/lib/format-api-error";

const SKIP_PATHS = [
  "/login",
  "/registro",
  "/olvidar-contrasena",
  "/actualizar-contrasena",
  "/mi-cuenta/perfil",
  // "/checkout",
];

export function ProfileIncompleteGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading: isLoadingAuth } = useAuth();
  const { data: meData, isLoading: isLoadingMe } = useMe();
  const { mutate: doUpdate, isPending } = useUpdateMe();

  const [open, setOpen] = useState(false);
  const [lastAutoPath, setLastAutoPath] = useState<string | null>(null);
  const [cedula, setCedula] = useState("");
  const [fullName, setFullName] = useState("");
  const [errors, setErrors] = useState<{
    cedula?: string;
    fullName?: string;
  }>({});

  const isLoggedIn = !!user && !isLoadingAuth;
  const meLoaded = !isLoadingMe && !!meData?.user;
  const needsCedula = meLoaded ? !meData.user.cedula : false;
  const needsFullName = meLoaded ? !meData.user.fullName : false;
  const isIncomplete = needsCedula || needsFullName;

  const shouldShow = isLoggedIn && meLoaded && isIncomplete;
  const isSkipped = SKIP_PATHS.some((p) => pathname?.startsWith(p));

  const handleOpenChange = (next: boolean) => {
    if (!next && isIncomplete) return;

    if (next && meData?.user) {
      setCedula(meData.user.cedula ?? "");
      setFullName(meData.user.fullName ?? "");
      setErrors({});
    }

    setOpen(next);
  };

  if (shouldShow && !isSkipped && pathname && pathname !== lastAutoPath) {
    setLastAutoPath(pathname);
    setOpen(true);

    if (meData?.user) {
      setCedula(meData.user.cedula ?? "");
      setFullName(meData.user.fullName ?? "");
    }
  }

  if (!shouldShow && lastAutoPath) {
    setLastAutoPath(null);
    setOpen(false);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: { cedula?: string; fullName?: string } = {};
    if (needsCedula) payload.cedula = cedula.trim();
    if (needsFullName) payload.fullName = fullName.trim();

    const parsed = updateUserSchema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors: { cedula?: string; fullName?: string } = {};

      for (const issue of parsed.error.issues) {
        const key = issue.path[0];

        if (key === "cedula" || key === "fullName") {
          fieldErrors[key] = issue.message;
        }
      }

      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    doUpdate(parsed.data, {
      onSuccess: () => {
        toast.success("Datos guardados", {
          description: "Tu información se actualizó correctamente.",
        });
        setOpen(false);
      },
      onError: (err: unknown) => {
        const f = formatApiError(err);
        toast.error(f.title, { description: f.description });
      },
    });
  };

  const handleGoToProfile = () => {
    setOpen(false);
    router.push("/mi-cuenta/perfil");
  };

  if (!shouldShow) return null;

  return (
    <DialogRoot
      open={open}
      onOpenChange={(e) => handleOpenChange(e.open)}
      placement="center"
      size={{ base: "xs", md: "sm" }}
      closeOnInteractOutside={false}
      closeOnEscape={false}
    >
      <DialogBackdrop bg="rgba(0,0,0,0.75)" backdropFilter="blur(4px)" />
      <DialogPositioner>
        <DialogContent
          as="form"
          onSubmit={handleSubmit}
          bg="brand.panel"
          border="1px solid rgba(255,255,255,0.12)"
          borderRadius="2xl"
          boxShadow="0 24px 80px rgba(0,0,0,0.7)"
          color="white"
        >
          <DialogHeader>
            <DialogTitle color="white" fontSize="xl">
              Completa tus datos
            </DialogTitle>

            <DialogCloseTrigger
              color="white"
              _hover={{ bg: "rgba(255,255,255,0.1)" }}
            />
          </DialogHeader>

          <DialogBody>
            <VStack align="stretch" gap={4}>
              <Text color="white/75" fontSize="sm" lineHeight="1.5">
                Para seguir navegando necesitamos tu nombre y cédula.
                Puedes completarlos aquí o desde tu perfil.
              </Text>

              <Stack gap={4}>
                {needsFullName && (
                  <Field.Root invalid={!!errors.fullName}>
                    <Field.Label color="brand.muted">
                      <HStack gap={2}>
                        <IconUser size={16} color="#00e5ff" />
                        <Text>Nombre completo</Text>
                      </HStack>
                    </Field.Label>

                    <InputGroup>
                      <Input
                        autoFocus
                        placeholder="Tu nombre completo"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
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
                    </InputGroup>

                    {errors.fullName && (
                      <Field.ErrorText color="red.300">
                        {errors.fullName}
                      </Field.ErrorText>
                    )}
                  </Field.Root>
                )}

                {needsCedula && (
                  <Field.Root invalid={!!errors.cedula}>
                    <Field.Label color="brand.muted">
                      <HStack gap={2}>
                        <IconId size={16} color="#00e5ff" />
                        <Text>Cédula</Text>
                      </HStack>
                    </Field.Label>

                    <InputGroup>
                      <Input
                        inputMode="numeric"
                        placeholder="Número de cédula"
                        value={cedula}
                        onChange={(e) =>
                          setCedula(e.target.value.replace(/\D/g, ""))
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
                    </InputGroup>

                    {errors.cedula && (
                      <Field.ErrorText color="red.300">
                        {errors.cedula}
                      </Field.ErrorText>
                    )}
                  </Field.Root>
                )}
              </Stack>
            </VStack>
          </DialogBody>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleGoToProfile}
              color="white"
              borderColor="rgba(255,255,255,0.16)"
              borderRadius="xl"
              _hover={{ bg: "rgba(255,255,255,0.06)" }}
            >
              <IconArrowLeft size={16} style={{ marginRight: 6 }} />
              Ir a mi perfil
            </Button>

            <Button
              type="submit"
              bg="utp.azul"
              color="brand.dark"
              fontWeight="black"
              borderRadius="xl"
              loading={isPending}
              _hover={{ opacity: 0.9, transform: "translateY(-1px)" }}
              transition="all 0.2s ease"
            >
              Guardar y continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  );
}
