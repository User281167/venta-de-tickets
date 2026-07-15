import {
  Box,
  Button,
  DialogBackdrop,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogPositioner,
  DialogRoot,
  DialogTitle,
  Heading,
  HStack,
  Stack,
  Text,
} from "@chakra-ui/react";
import { IconPlus } from "@tabler/icons-react";
import React from "react";
import { motion, useReducedMotion } from "framer-motion";

import { TicketTypeForm } from "@/features/ticket-types/components/TicketTypeForm";

interface Props {
  showCreate: boolean;
  setShowCreate: (value: boolean) => void;
  createMutation: any;
}

export const TicketTypesHeader = React.memo(function TicketTypesHeader({
  showCreate,
  setShowCreate,
  createMutation,
}: Props) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      initial={reduced ? {} : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Stack
        direction={{ base: "column", sm: "row" }}
        justify="space-between"
        align={{ base: "flex-start", sm: "center" }}
        gap={4}
      >
        <Box>
          <Text
            color="brand.cyan"
            fontSize="sm"
            fontWeight="black"
            textTransform="uppercase"
            letterSpacing="0.15em"
          >
            Configuración del evento
          </Text>
          <Heading as="h1" size="2xl" color="white" lineHeight="1.1">
            Tipos de entrada
          </Heading>
        </Box>

        <Button
          bg="brand.violet"
          color="white"
          fontWeight="bold"
          borderRadius="xl"
          px={6}
          size="lg"
          _hover={{ bg: "#6a2be2", transform: "translateY(-2px)" }}
          transition="all 0.2s ease"
          onClick={() => setShowCreate(true)}
        >
          <IconPlus size={20} />
          Nuevo tipo
        </Button>
      </Stack>

      <DialogRoot open={showCreate} onOpenChange={(e) => setShowCreate(e.open)}>
        <DialogBackdrop />

        <DialogPositioner>
          <DialogContent
            bg="brand.panel"
            color="brand.light"
            border="1px solid rgba(255,255,255,0.08)"
            borderRadius="2xl"
            maxW="600px"
            w="full"
            mx={4}
          >
            <DialogHeader>
              <DialogTitle color="white" fontSize="2xl">
                Crear tipo de entrada
              </DialogTitle>
            </DialogHeader>

            <DialogBody>
              <TicketTypeForm
                onCreate={async (data) => {
                  await createMutation.mutateAsync(data);
                  setShowCreate(false);
                }}
                onCancel={() => setShowCreate(false)}
              />
            </DialogBody>
            <DialogCloseTrigger color="brand.muted" />
          </DialogContent>
        </DialogPositioner>
      </DialogRoot>
    </motion.div>
  );
});
