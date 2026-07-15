"use client";

import {
  DialogBackdrop,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogPositioner,
  DialogRoot,
  DialogTitle,
} from "@chakra-ui/react";
import React from "react";

import { useCreateUser } from "../api/admin-users.queries";
import type { CreateUserInput } from "../api/admin-users.queries";
import { UserCreateForm } from "./UserCreateForm";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const UserCreateDialog = React.memo(function UserCreateDialog({
  open,
  setOpen,
}: Props) {
  const createMutation = useCreateUser();

  return (
    <DialogRoot
      open={open}
      onOpenChange={(e) => {
        if (!e.open) setOpen(false);
      }}
    >
      <DialogBackdrop />
      <DialogPositioner>
        <DialogContent
          bg="brand.panel"
          color="brand.light"
          border="1px solid rgba(255,255,255,0.08)"
          borderRadius="2xl"
          maxW="520px"
          w="full"
          mx={4}
        >
          <DialogHeader>
            <DialogTitle color="white" fontSize="2xl">
              Crear usuario
            </DialogTitle>
          </DialogHeader>

          <DialogBody>
            <UserCreateForm
              onSave={async (data: CreateUserInput) => {
                await createMutation.mutateAsync(data);
                setOpen(false);
              }}
              onCancel={() => setOpen(false)}
            />
          </DialogBody>

          <DialogCloseTrigger color="brand.muted" />
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  );
});
