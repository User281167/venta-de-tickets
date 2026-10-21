"use client";

import { useState } from "react";
import { DonationButton } from "@/features/donaciones/components/DonationButton";

export default function DonationPage() {
  const [open, setOpen] = useState(true);

  return (
    <main>
      <DonationButton
        account="VICTIMAS"
        label="Donar a UTPtón"
        open={open}
        onOpenChange={setOpen}
      />
    </main>
  );
}
