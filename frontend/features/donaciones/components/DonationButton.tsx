"use client";

import { useState } from "react";
import { Button } from "@chakra-ui/react";
import { DonationForm } from "./DonationForm";
import type { DonationAccount } from "./DonationForm";

interface Props {
  account: DonationAccount;
  label?: string;
}

export function DonationButton({ account, label }: Props) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const buttonLabel =
    label ??
    (account === "LA_CONVENCION"
      ? "Donar a La Convención"
      : "Donar a Barranqueros UTP");

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="!group !inline-flex !h-14 !w-full !items-center !justify-center !gap-3 !rounded-full !border !px-7 !text-sm  !font-semibold !text-white !transition !duration-300 hover:!translate-y-[-2px] sm:!w-[360px]"
        style={{
          background:
            "linear-gradient(#020414, #020414) padding-box, linear-gradient(90deg, #ff0f7b, #00e5ff) border-box",
          border: "1px solid transparent",
          boxShadow: "0 0 24px rgba(0,229,255,0.18)",
        }}
        disabled={submitting}
      >
        {account === "BARRANQUEROS_UTP" && (
          <img
            src="/barranqueros-logo.png"
            alt="Barranqueros UTP"
            className="!h-6 !w-6 !object-contain"
          />
        )}

        <span>{buttonLabel}</span>
      </Button>
      <DonationForm account={account} open={open} onClose={() => setOpen(false)} onSubmitting={setSubmitting} />
    </>
  );
}
