"use client";

import { useState, type FormEvent } from "react";
import {
  Box,
  Button,
  Field,
  Heading,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react";
import {
  IconCalendarEvent,
  IconId,
  IconSearch,
  IconShieldCheck,
} from "@tabler/icons-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuroraBackground } from "@/shared/components/AuroraBackground";
import { DefaultWaves } from "@/shared/components/Waves";
import { checkAsociado, type AsociadoStatus } from "../api/registro.client";

function formatDate(value: AsociadoStatus["fechaFinalizacion"]) {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(date);
}

export function AsociadoCheckPage() {
  const [cedula, setCedula] = useState("");
  const [checkedCedula, setCheckedCedula] = useState("");
  const [status, setStatus] = useState<AsociadoStatus | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus(null);
    setError("");

    if (!/^\d{8,15}$/.test(cedula)) {
      setError("Ingresa una cédula de 8 a 15 dígitos.");
      return;
    }

    setBusy(true);

    try {
      setStatus(await checkAsociado(cedula));
      setCheckedCedula(cedula);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No fue posible consultar la asociación.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Navbar />

      <main className="!relative !isolate !min-h-screen !overflow-hidden !bg-[#030817] !px-4 !pb-24 !pt-28 !text-white sm:!pt-32">
        <AuroraBackground imageOpacity={28} particleCount={0} />

        <div className="!pointer-events-none !absolute !inset-0 !z-[1] !bg-[radial-gradient(ellipse_at_50%_0%,rgba(50,105,255,0.18),transparent_55%),linear-gradient(180deg,rgba(3,8,23,0.25),#030817_95%)]" />

        <DefaultWaves />

        <div className="!relative !z-10 !mx-auto !grid !w-full !max-w-6xl !items-center !gap-10 md:!grid-cols-[0.9fr_1.1fr]">
          <section className="!space-y-6">
            <span className="!inline-flex !items-center !gap-2 !rounded-full !border !border-[#f5bd35]/30 !bg-[#f5bd35]/10 !px-4 !py-2 !text-sm !font-semibold !text-[#ffdc82]">
              <IconShieldCheck size={17} aria-hidden="true" /> Comunidad UTP
            </span>

            <Heading className="!max-w-xl !text-4xl !font-bold !leading-tight sm:!text-5xl">
              Consulta el estado de tu asociación
            </Heading>

            <Text className="!max-w-xl !text-lg !leading-8 !text-white/70">
              Verifica si tu vínculo como asociado está vigente. Solo necesitas
              tu número de cédula.
            </Text>

            <div className="!flex !items-start !gap-3 !rounded-2xl !border !border-white/10 !bg-white/[0.04] !p-4 !text-sm !leading-6 !text-white/60">
              <IconId
                className="!mt-1 !shrink-0 !text-[#8ac9ff]"
                size={20}
                aria-hidden="true"
              />
              La consulta muestra únicamente el resultado y la fecha de
              finalización registrada.
            </div>
          </section>

          <Box className="!rounded-3xl !border !border-white/15 !bg-[#07152b]/85 !p-6 !shadow-[0_24px_80px_rgba(0,0,0,.35)] !backdrop-blur-xl sm:!p-8">
            <Stack as="form" gap="5" onSubmit={onSubmit}>
              <div className="!space-y-2">
                <Heading size="xl">Verifica tu estado</Heading>
                <Text className="!text-sm !text-white/60">
                  Escribe tu cédula para realizar la consulta.
                </Text>
              </div>

              <Field.Root>
                <Field.Label className="!text-white/85">
                  Número de cédula
                </Field.Label>
                <Input
                  value={cedula}
                  onChange={(event) => setCedula(event.target.value)}
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="Ej. 123456789"
                  className="!h-12 !border-white/20 !bg-white/[0.06] !text-white placeholder:!text-white/35"
                />
              </Field.Root>

              <Button
                type="submit"
                loading={busy}
                colorPalette="yellow"
                className="!h-12 !rounded-full !font-bold"
              >
                <IconSearch size={18} aria-hidden="true" /> Consultar asociación
              </Button>

              {error && (
                <Text
                  role="alert"
                  className="!rounded-xl !border !border-red-300/20 !bg-red-400/10 !p-3 !text-sm !text-red-200"
                >
                  {error}
                </Text>
              )}

              {status &&
                (() => {
                  const fecha = formatDate(status.fechaFinalizacion);

                  return status.isAsociado ? (
                    <div
                      role="status"
                      className="!space-y-4 !rounded-2xl !border !border-emerald-300/25 !bg-emerald-400/10 !p-5"
                    >
                      <div className="!flex !items-center !gap-3">
                        <IconShieldCheck
                          className="!text-emerald-300"
                          size={25}
                          aria-hidden="true"
                        />

                        <div>
                          <Text className="!font-bold !text-emerald-200">
                            Asociación vigente
                          </Text>

                          <Text className="!text-sm !text-white/65">
                            Tu cédula está registrada como asociada.
                          </Text>
                        </div>
                      </div>

                      <div className="!grid !gap-3 sm:!grid-cols-2">
                        <div className="!rounded-xl !bg-black/15 !p-3">
                          <Text className="!text-xs !text-white/50">
                            CÉDULA
                          </Text>

                          <Text className="!font-semibold">
                            {checkedCedula}
                          </Text>
                        </div>

                        <div className="!rounded-xl !bg-black/15 !p-3">
                          <Text className="!text-xs !text-white/50">
                            VIGENTE HASTA
                          </Text>

                          <Text className="!font-semibold">
                            {fecha ?? "Fecha no disponible"}
                          </Text>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      role="status"
                      className="!space-y-2 !rounded-2xl !border !border-amber-300/20 !bg-amber-300/[0.08] !p-5"
                    >
                      <Text className="!font-bold !text-amber-100">
                        {fecha
                          ? "Asociación finalizada"
                          : "No encontramos una asociación vigente"}
                      </Text>

                      <Text className="!text-sm !leading-6 !text-white/70">
                        {fecha
                          ? `La asociación registrada para la cédula ${checkedCedula} finalizó el ${fecha}.`
                          : "Con esta cédula no aparece una asociación vigente en el registro."}
                      </Text>

                      {fecha && (
                        <Text className="!flex !items-center !gap-2 !text-xs !text-white/50">
                          <IconCalendarEvent size={16} aria-hidden="true" />{" "}
                          Cédula: {checkedCedula}
                        </Text>
                      )}
                    </div>
                  );
                })()}
            </Stack>
          </Box>
        </div>
      </main>
      <Footer />
    </>
  );
}
