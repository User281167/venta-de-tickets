"use client";

import { Suspense } from "react";
import { ConfirmacionesInner } from "@/features/confirmations/components/ConfirmacionesInner";

export default function ConfirmacionesPage() {
  return (
    <Suspense fallback={null}>
      <ConfirmacionesInner />
    </Suspense>
  );
}
