"use client";

import { useState } from "react";
import { DonationButton } from "./DonationButton";
import { IconX } from "@tabler/icons-react";

export function DonationFloat() {
  const [show, setShow] = useState(true);

  if (!show) return null;

  return (
    <section className="!fixed !bottom-0 !left-0 !z-50 !bg-utp-noche !text-white !w-full !p-6 !border !border-utp-azul !rounded-base !shadow-xs !flex !flex-col !items-center !justify-center">
      <button
        type="button"
        aria-label="Cerrar invitación a donar"
        className="!absolute !top-3 !right-3 cursor-pointer"
        onClick={() => setShow(false)}
      >
        <IconX className="!w-6 !h-6" />
      </button>

      <h5 className="!mb-3 !text-3xl !font-semibold !tracking-tight !leading-8">
        Súmate a UTPtón
      </h5>

      <p className="!text-body !mb-6">
        Tu aporte voluntario apoya a la comunidad UTP afectada por el sismo.
      </p>

      <DonationButton account="VICTIMAS" label="Donar a UTPtón" />
    </section>
  );
}
