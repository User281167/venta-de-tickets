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
        className="!absolute !top-3 !right-3 cursor-pointer"
        onClick={() => setShow(false)}
      >
        <IconX className="!w-6 !h-6" />
      </button>

      <h5 className="!mb-3 !text-3xl !font-semibold !tracking-tight !leading-8">
        Hoy podemos ayudar y hacer una diferencia
      </h5>

      <p className="!text-body !mb-6">
        Apoya a las víctimas y damnificados por el sismo en Colombia con tu
        donación.
      </p>

      <DonationButton account="VICTIMAS" label="Quiero ayudar" />
    </section>
  );
}
