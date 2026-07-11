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

import { useUpdateUser } from "../api/admin-users.queries";
import type { UserRow } from "../api/admin-users.queries";
import { UserEditForm } from "./UserEditForm";

interface Props {
  user: UserRow | null;
  setUser: (user: UserRow | null) => void;
}

export const UserEditDialog = React.memo(function UserEditDialog({
  user,
  setUser,
}: Props) {
  const updateMutation = useUpdateUser();

  return (
    <DialogRoot
      open={!!user}
      onOpenChange={(e) => {
        if (!e.open) setUser(null);
      }}
    >
      <DialogBackdrop />
      <DialogPositioner>
        <DialogContent bg="gray.600" color="brand.light">
          <DialogHeader>
            <DialogTitle color="brand.light">
              Editar: {user?.fullName ?? ""}
            </DialogTitle>
          </DialogHeader>

          <DialogBody>
            {user && (
              <UserEditForm
                user={user}
                onSave={async (id, data) => {
                  await updateMutation.mutateAsync({ id, data });
                  setUser(null);
                }}
                onCancel={() => setUser(null)}
              />
            )}
          </DialogBody>

          <DialogCloseTrigger color="brand.muted" />
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  );
});
