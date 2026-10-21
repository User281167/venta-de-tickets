"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { QrCode } from "@chakra-ui/react";
import { IconHeart } from "@tabler/icons-react";
import Image from "next/image";
import { useDonationCounter } from "../api/donation-counter.queries";
import { formatCurrency } from "@/shared/utils/formats";

export function DonationPresentationFrame() {
  const [donationUrl, setDonationUrl] = useState("");
  const { data, isError } = useDonationCounter();
  const amount = isError
    ? "—"
    : data
      ? formatCurrency(data.currentValue)
      : "...";

  useEffect(() => {
    setDonationUrl(`${window.location.origin}/donar`);
  }, []);

  return (
    <main className="!relative !isolate !flex !min-h-screen !items-center !justify-center !overflow-hidden !bg-[#030817] !px-6 !py-10 !text-white sm:!px-10 2xl:!px-16">
      <div className="!pointer-events-none !absolute !inset-0 !bg-[radial-gradient(ellipse_at_20%_50%,rgba(0,204,255,.2),transparent_38%),radial-gradient(ellipse_at_80%_45%,rgba(164,46,255,.2),transparent_40%),radial-gradient(ellipse_at_50%_110%,rgba(245,189,53,.14),transparent_45%)]" />
      <div className="!pointer-events-none !absolute !inset-0 !opacity-[0.12] ![background-image:linear-gradient(rgba(255,255,255,.15)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.15)_1px,transparent_1px)] ![background-size:64px_64px] ![mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />

      <div className="!relative !mx-auto !grid !w-full !max-w-7xl !items-center !gap-10 lg:!grid-cols-[minmax(0,1fr)_auto] lg:!gap-10 xl:!max-w-[1500px] xl:!gap-12 2xl:!max-w-[1600px] 2xl:!gap-14">
        <section
          className="!flex !flex-col !items-center !text-center lg:!items-start lg:!text-left"
          style={
            {
              containerType: "inline-size",
              "--amount-digits": Math.max(1, amount.replace(/\D/g, "").length),
            } as CSSProperties
          }
        >
          <Image
            src="/assets/todos_somo_utp_transparent.png"
            alt="Todos somos UTP"
            width={520}
            height={250}
            priority
            className="!mb-5 !h-auto !max-h-[22vh] !w-auto !max-w-[min(80vw,520px)] !object-contain"
          />

          <div className="!mb-4 !inline-flex !items-center !gap-2 !rounded-full !border !border-[#ff0f7b]/30 !bg-[#ff0f7b]/10 !px-4 !py-2 !text-sm !font-semibold !uppercase !tracking-[.18em] !text-[#ff7ab5]">
            <IconHeart size={17} aria-hidden="true" />
            Solidaridad UTP
          </div>

          <p className="!mb-3 !text-lg !font-medium !text-white/65 sm:!text-2xl">
            Juntos ya recaudamos
          </p>

          <p
            aria-live="polite"
            className="!whitespace-nowrap !bg-gradient-to-r !from-[#ffe28a] !via-[#ffffff] !to-[#80eaff] !bg-clip-text !font-black !leading-none !tracking-[-.01em] !text-transparent !drop-shadow-[0_0_38px_rgba(88,186,255,.2)] !text-[clamp(3rem,12cqw,9rem)] xl:!text-[clamp(4rem,calc(72cqw/var(--amount-digits)),9rem)]"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {amount}
          </p>

          <p className="!mt-3 !text-sm !font-semibold !uppercase !tracking-[.16em] !text-white/60 sm:!text-base">
            Pesos colombianos recaudados
          </p>

          <a
            href={donationUrl || "/donar"}
            className="!mt-8 !break-all !rounded-full !border !border-white/15 !bg-white/[.06] !px-5 !py-3 !text-base !font-medium !text-[#9bdcff] !underline !decoration-white/25 !underline-offset-4 !transition hover:!border-[#9bdcff]/60 hover:!bg-white/10 sm:!text-xl"
          >
            {donationUrl || "/donar"}
          </a>
        </section>

        <section className="!mx-auto !flex !w-full !max-w-[340px] !flex-col !items-center !gap-5 !rounded-[2rem] !border !border-white/15 !bg-[#09162d]/85 !p-6 !shadow-[0_30px_100px_rgba(0,0,0,.45)] !backdrop-blur-xl sm:!p-8 xl:!max-w-[430px] xl:!gap-6 xl:!p-9 2xl:!max-w-[500px] 2xl:!gap-7 2xl:!p-10">
          <Image
            src="/assets/utpton/Logos/Horizontal blanco.png"
            alt="UTPtón, XXIV Convención de Egresados UTP"
            width={320}
            height={110}
            priority
            className="!h-auto !w-[min(100%,270px)] xl:!w-[min(100%,320px)] 2xl:!w-[min(100%,380px)]"
          />

          <div className="rounded-2xl bg-white p-3 shadow-[0_0_48px_rgba(88,186,255,.22)]">
            {donationUrl && (
              <QrCode.Root value={donationUrl} size="2xl" color="black">
                <QrCode.Frame className="!h-56 !w-56 xl:!h-[300px] xl:!w-[300px] 2xl:!h-[clamp(18rem,20vw,23.75rem)] 2xl:!w-[clamp(18rem,20vw,23.75rem)]">
                  <QrCode.Pattern />
                </QrCode.Frame>
              </QrCode.Root>
            )}
          </div>

          <p className="!text-center !text-lg !font-bold !text-white sm:!text-xl">
            Escanea y súmate a UTPtón
          </p>

          <p className="!text-center !text-sm !text-white/55">
            Tu aporte fortalece a nuestra comunidad.
          </p>
        </section>
      </div>
    </main>
  );
}
