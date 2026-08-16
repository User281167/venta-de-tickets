"use client";

import {
  Button,
  Dialog,
  Field,
  HStack,
  NumberInput,
  Portal,
  Stack,
  Text,
} from "@chakra-ui/react";
import { IconSettings } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import {
  useAdminDonationCounter,
  useUpdateDonationCounter,
} from "../api/admin-donations.queries";
import { formatCurrency } from "@/shared/utils/formats";

interface MetaDonationModalProps {
  open: boolean;
  onClose: () => void;
}

export function MetaDonationModal({ open, onClose }: MetaDonationModalProps) {
  const { data, isLoading } = useAdminDonationCounter();
  const updateMutation = useUpdateDonationCounter();
  const [currentValue, setCurrentValue] = useState<string>("");
  const [metaValue, setMetaValue] = useState<string>("");

  const currentNumRef = useRef<number>(0);
  const metaNumRef = useRef<number>(0);

  useEffect(() => {
    if (data) {
      setCurrentValue(String(data.currentValue));
      setMetaValue(String(data.metaValue));
      currentNumRef.current = data.currentValue;
      metaNumRef.current = data.metaValue;
    }
  }, [data]);

  const handleSave = () => {
    const payload: { currentValue?: number; metaValue?: number } = {};

    if (!Number.isNaN(currentNumRef.current) && currentNumRef.current >= 0) {
      payload.currentValue = currentNumRef.current;
    }
    if (!Number.isNaN(metaNumRef.current) && metaNumRef.current >= 0) {
      payload.metaValue = metaNumRef.current;
    }

    console.log(payload);

    if (Object.keys(payload).length === 0) {
      return;
    }

    updateMutation.mutate(payload, { onSuccess: onClose });
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(e) => {
        if (!e.open) onClose();
      }}
      placement="center"
      size="md"
    >
      <Portal>
        <Dialog.Backdrop bg="rgba(2,4,20,0.75)" />
        <Dialog.Positioner>
          <Dialog.Content
            bg="rgba(2,4,20,0.95)"
            color="white"
            border="1px solid rgba(255,255,255,0.08)"
            borderRadius="2xl"
          >
            <Dialog.Header borderBottom="1px solid rgba(255,255,255,0.06)">
              <HStack gap={2}>
                <IconSettings size={20} color="#00e5ff" />

                <Dialog.Title fontSize="lg" fontWeight="bold">
                  Configurar contador de donaciones
                </Dialog.Title>
              </HStack>
            </Dialog.Header>

            <Dialog.Body py={6}>
              {isLoading || !data ? (
                <Text color="brand.muted" fontSize="sm">
                  Cargando contador actual...
                </Text>
              ) : (
                <Stack gap={5}>
                  <Text color="brand.muted" fontSize="sm">
                    Ajusta los valores mostrados públicamente en la landing. El
                    valor actual se incrementa automáticamente con cada donación
                    confirmada; úsalo solo para corregir discrepancias.
                  </Text>

                  <Field.Root>
                    <Field.Label color="white" fontSize="sm">
                      Valor actual (COP)
                    </Field.Label>

                    <Text fontSize="xs" color="brand.muted" mb={1}>
                      Actual: {formatCurrency(data.currentValue)}
                    </Text>

                    <NumberInput.Root
                      value={currentValue}
                      min={0}
                      step={100_000}
                      w="full"
                      bg="rgba(255,255,255,0.04)"
                      border="1px solid rgba(255,255,255,0.12)"
                      color="white"
                      _hover={{ borderColor: "rgba(255,255,255,0.16)" }}
                      _focus={{
                        borderColor: "brand.cyan",
                        boxShadow: "0 0 12px rgba(0,229,255,0.2)",
                      }}
                      formatOptions={{
                        style: "currency",
                        currency: "COP",
                        currencyDisplay: "narrowSymbol",
                        currencySign: "standard",
                      }}
                      onValueChange={(details) => {
                        setCurrentValue(details.value); // Update string para la UI
                        currentNumRef.current = details.valueAsNumber; // Update number para logic
                      }}
                    >
                      <NumberInput.Control />
                      <NumberInput.Input />
                    </NumberInput.Root>
                  </Field.Root>

                  <Field.Root>
                    <Field.Label color="white" fontSize="sm">
                      Meta (COP)
                    </Field.Label>

                    <Text fontSize="xs" color="brand.muted" mb={1}>
                      Actual: {formatCurrency(data.metaValue)}
                    </Text>

                    <NumberInput.Root
                      value={metaValue}
                      min={0}
                      step={100_000}
                      w="full"
                      bg="rgba(255,255,255,0.04)"
                      border="1px solid rgba(255,255,255,0.12)"
                      color="white"
                      _hover={{ borderColor: "rgba(255,255,255,0.16)" }}
                      _focus={{
                        borderColor: "brand.cyan",
                        boxShadow: "0 0 12px rgba(0,229,255,0.2)",
                      }}
                      formatOptions={{
                        style: "currency",
                        currency: "COP",
                        currencyDisplay: "narrowSymbol",
                        currencySign: "standard",
                      }}
                      onValueChange={(details) => {
                        setMetaValue(details.value); // Update string para la UI
                        metaNumRef.current = details.valueAsNumber; // Update number para logic
                      }}
                    >
                      <NumberInput.Control />
                      <NumberInput.Input />
                    </NumberInput.Root>
                  </Field.Root>

                  {updateMutation.isError && (
                    <Text color="red.400" fontSize="sm">
                      No se pudo guardar. Verifica los valores e inténtalo de
                      nuevo.
                    </Text>
                  )}
                </Stack>
              )}
            </Dialog.Body>

            <Dialog.Footer borderTop="1px solid rgba(255,255,255,0.06)">
              <HStack gap={3} justify="flex-end" w="full">
                <Button
                  variant="ghost"
                  color="brand.muted"
                  onClick={onClose}
                  disabled={updateMutation.isPending}
                  _hover={{ color: "black" }}
                >
                  Cancelar
                </Button>

                <Button
                  bg="utp.azul"
                  color="white"
                  _hover={{ bg: "#0052cc" }}
                  onClick={handleSave}
                  loading={updateMutation.isPending}
                  loadingText="Guardando"
                  disabled={isLoading || !data}
                >
                  Guardar
                </Button>
              </HStack>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
