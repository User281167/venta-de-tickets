"use client";

import { useState, type FormEvent } from "react";
import {
  Box,
  Button,
  Field,
  Heading,
  Input,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import {
  IconArrowLeft,
  IconArrowUpRight,
  IconCheck,
  IconHeart,
  IconHome,
  IconUserPlus,
} from "@tabler/icons-react";
import NextImage from "next/image";
import NextLink from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { AuroraBackground } from "@/shared/components/AuroraBackground";
import { DefaultWaves } from "@/shared/components/Waves";
import { Particles } from "@/shared/components/Particles";
import { submitRegistration, type RegisterInput } from "../api/registro.client";

const initial: RegisterInput = {
  name: "",
  cedula: "",
  email: "",
  phone: "",
  profesion: "",
};

const PROFESSION_OPTIONS = [
  "Estudiante",
  "Docente/profesor",
  "Administrativo UTP",
  "Egresado",
  "Contratista/aliado",
] as const;

export function RegisterPage() {
  const [values, setValues] = useState(initial);
  const [professionChoice, setProfessionChoice] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (!/^\d{8,15}$/.test(values.cedula)) {
      setError("Ingresa una cédula de 8 a 15 dígitos.");
      return;
    }

    if (!values.profesion.trim()) {
      setError("Selecciona tu estamento o escribe tu profesión.");
      return;
    }

    setBusy(true);
    try {
      await submitRegistration(values);
      setDone(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "No se pudo completar el registro. Intenta de nuevo.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="!min-h-screen !bg-[#030817] !text-white">
        <section className="!relative !isolate !overflow-hidden !bg-[#030817] !px-4 !pb-20 !pt-28 sm:!px-6 sm:!pt-32">
          <AuroraBackground imageOpacity={28} particleCount={0} />
          <div className="!pointer-events-none !absolute !inset-0 !z-[1] !bg-[radial-gradient(ellipse_at_50%_0%,rgba(50,105,255,0.18),transparent_55%),linear-gradient(180deg,rgba(3,8,23,0.25),#030817_95%)]" />
          <div className="!pointer-events-none !absolute !inset-0 !z-[2]">
            <Particles count={28} />
          </div>
          <DefaultWaves />

          <div className="!relative !z-10 !mx-auto !grid !w-full !max-w-6xl !items-center !gap-8 md:!grid-cols-[0.85fr_1.15fr] md:!gap-10">
            <div className="!flex !flex-col !items-start !gap-6">
              <NextLink
                href="/"
                className="!inline-flex !items-center !gap-2 !rounded-full !border !border-white/15 !bg-white/[0.06] !px-4 !py-2 !text-sm !text-white/80 !transition-colors hover:!bg-white/10 hover:!text-white focus-visible:!outline focus-visible:!outline-2 focus-visible:!outline-offset-4 focus-visible:!outline-[#7dd3fc]"
              >
                <IconArrowLeft size={17} aria-hidden="true" />
                <IconHome size={16} aria-hidden="true" />
                Volver al inicio
              </NextLink>

              <NextImage
                src="/assets/utpton/Logos/Horizontal blanco.png"
                alt="UTPtón, XXIV Convención de Egresados UTP"
                width={320}
                height={110}
                className="!h-14 !w-auto sm:!h-16"
                priority
              />

              <div className="!flex !flex-col !gap-4">
                <span className="!text-xs !font-bold !uppercase !tracking-[0.22em] !text-[#f5bd35]">
                  XXIV Convención de Egresados UTP · 2026
                </span>
                <Heading
                  as="h1"
                  className="!max-w-xl !text-4xl !font-semibold !leading-[1.04] !tracking-tight sm:!text-5xl"
                >
                  Regístrate para ser parte de{" "}
                  <span className="!bg-gradient-to-r !from-[#8ac9ff] !via-[#c2a4ff] !to-[#ffcc75] !bg-clip-text !text-transparent">
                    La U del Futuro.
                  </span>
                </Heading>
                <Text className="!max-w-lg !text-base !leading-7 !text-[#c5cee0] sm:!text-lg">
                  Completa tus datos y prepárate para reencontrarte con la
                  comunidad UTP en una jornada de futuro, oportunidades y
                  solidaridad.
                </Text>
              </div>

              <div className="!flex !flex-wrap !gap-2 !text-xs !text-white/65 sm:!text-sm">
                {["Encuentro", "Reactivación", "Solidaridad"].map((item) => (
                  <span
                    key={item}
                    className="!rounded-full !border !border-white/10 !bg-white/[0.05] !px-3 !py-1.5"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <Box className="glass-card !relative !rounded-3xl !border-white/15 !bg-[#07152b]/75 !p-6 !shadow-[0_28px_100px_rgba(0,0,0,.42)] !backdrop-blur-2xl sm:!p-9">
              {done ? (
                <div className="!flex !flex-col !items-center !gap-5 !py-7 !text-center">
                  <div className="!flex !h-16 !w-16 !items-center !justify-center !rounded-full !border !border-emerald-300/30 !bg-emerald-300/10 !text-emerald-200">
                    <IconCheck size={32} aria-hidden="true" />
                  </div>
                  <div>
                    <Heading
                      as="h2"
                      className="!text-2xl !font-bold !text-white"
                    >
                      ¡Gracias por registrarte!
                    </Heading>
                    <Text className="!mt-3 !leading-7 !text-white/70">
                      Tu registro quedó recibido. Te esperamos en la Convención
                      de Egresados UTP.
                    </Text>
                  </div>
                  <Button
                    asChild
                    variant="outline"
                    color="white"
                    borderColor="whiteAlpha.400"
                    _hover={{ color: "black" }}
                  >
                    <NextLink href="/">
                      <IconHome size={17} aria-hidden="true" /> Volver al inicio
                    </NextLink>
                  </Button>
                </div>
              ) : (
                <>
                  <div className="!mb-7">
                    <div className="!mb-3 !flex !h-11 !w-11 !items-center !justify-center !rounded-2xl !bg-[#f5bd35]/10 !text-[#f5bd35]">
                      <IconUserPlus size={22} aria-hidden="true" />
                    </div>
                    <Heading
                      as="h2"
                      className="!text-2xl !font-bold !text-white"
                    >
                      Registro al evento
                    </Heading>
                    <Text className="!mt-2 !text-sm !leading-6 !text-white/60">
                      Ingresa tus datos para confirmar tu participación.
                    </Text>
                  </div>

                  <form onSubmit={onSubmit}>
                    <Stack gap={4}>
                      {(
                        [
                          [
                            "name",
                            "Nombre completo",
                            "text",
                            "name",
                            "Tu nombre completo",
                          ],
                          [
                            "cedula",
                            "Cédula",
                            "text",
                            "off",
                            "Número de documento",
                          ],
                          [
                            "email",
                            "Correo electrónico",
                            "email",
                            "email",
                            "nombre@correo.com",
                          ],
                          [
                            "phone",
                            "Celular",
                            "tel",
                            "tel",
                            "Número de contacto",
                          ],
                        ] as const
                      ).map(([key, label, type, autoComplete, placeholder]) => (
                        <Field.Root key={key} required>
                          <Field.Label className="!mb-1.5 !text-sm !font-medium !text-white/85">
                            {label}
                          </Field.Label>
                          <Input
                            required
                            name={key}
                            type={type}
                            autoComplete={autoComplete}
                            inputMode={key === "cedula" ? "numeric" : undefined}
                            spellCheck={key === "name"}
                            value={values[key]}
                            onChange={(event) =>
                              setValues({
                                ...values,
                                [key]: event.target.value,
                              })
                            }
                            placeholder={placeholder}
                            color="white"
                            bg="whiteAlpha.50"
                            borderColor="whiteAlpha.200"
                            _placeholder={{ color: "whiteAlpha.500" }}
                            _focusVisible={{
                              borderColor: "#7dd3fc",
                              boxShadow: "0 0 0 1px #7dd3fc",
                            }}
                          />
                        </Field.Root>
                      ))}

                      <Field.Root required>
                        <Field.Label
                          htmlFor="profession"
                          className="!mb-1.5 !text-sm !font-medium !text-white/85"
                        >
                          Estamento / profesión
                        </Field.Label>
                        <select
                          id="profession"
                          required
                          name="professionChoice"
                          value={professionChoice}
                          onChange={(event) => {
                            const choice = event.target.value;
                            setProfessionChoice(choice);
                            setValues({
                              ...values,
                              profesion: choice === "Otro" ? "" : choice,
                            });
                          }}
                          className="!min-h-11 !w-full !rounded-lg !border !border-white/20 !bg-[#101b31] !px-3 !text-sm !text-white focus-visible:!outline focus-visible:!outline-2 focus-visible:!outline-offset-2 focus-visible:!outline-[#7dd3fc]"
                        >
                          <option value="" disabled>
                            Selecciona una opción
                          </option>
                          {PROFESSION_OPTIONS.map((profession) => (
                            <option key={profession} value={profession}>
                              {profession}
                            </option>
                          ))}
                          <option value="Otro">Otro</option>
                        </select>
                      </Field.Root>

                      {professionChoice === "Otro" && (
                        <Field.Root required>
                          <Field.Label className="!mb-1.5 !text-sm !font-medium !text-white/85">
                            Escribe tu profesión
                          </Field.Label>
                          <Input
                            required
                            name="profesion"
                            autoComplete="organization-title"
                            value={values.profesion}
                            onChange={(event) =>
                              setValues({
                                ...values,
                                profesion: event.target.value,
                              })
                            }
                            placeholder="Tu profesión o estamento"
                            color="white"
                            bg="whiteAlpha.50"
                            borderColor="whiteAlpha.200"
                            _placeholder={{ color: "whiteAlpha.500" }}
                          />
                        </Field.Root>
                      )}

                      {error && (
                        <Text
                          role="alert"
                          aria-live="polite"
                          className="!rounded-xl !border !border-red-300/20 !bg-red-300/10 !px-4 !py-3 !text-sm !text-red-200"
                        >
                          {error}
                        </Text>
                      )}

                      <Button
                        type="submit"
                        loading={busy}
                        size="lg"
                        className="!mt-2 !w-full !rounded-full !bg-[#f5bd35] !font-bold !text-[#08142b] hover:!bg-[#ffd46d]"
                      >
                        Confirmar registro
                      </Button>

                      <NextLink
                        href="/donar"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="!inline-flex !min-h-12 !w-full !items-center !justify-center !gap-2 !rounded-full !border !border-[#f5bd35]/60 !bg-[#f5bd35] !px-5 !py-3 !text-sm !font-bold !text-[#08142b] !shadow-[0_8px_28px_rgba(245,189,53,.24)] !transition-[transform,background-color,box-shadow] hover:!scale-[1.01] hover:!bg-[#ffd46d] hover:!shadow-[0_10px_34px_rgba(245,189,53,.36)] focus-visible:!outline focus-visible:!outline-2 focus-visible:!outline-offset-4 focus-visible:!outline-white"
                      >
                        <IconHeart size={18} aria-hidden="true" />
                        Donar a UTPtón
                        <IconArrowUpRight size={16} aria-hidden="true" />
                      </NextLink>
                      <Text className="!text-center !text-xs !leading-5 !text-white/55">
                        ¿Quieres conocer las actividades?{" "}
                        <Link
                          asChild
                          color="#8ac9ff"
                          textDecoration="underline"
                          textUnderlineOffset="3px"
                        >
                          <NextLink href="/agenda">Ver agenda</NextLink>
                        </Link>
                      </Text>
                    </Stack>
                  </form>
                </>
              )}
            </Box>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
