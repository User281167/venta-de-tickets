import type { Metadata } from "next";
import { Toaster } from "sonner";
import { Montserrat_Alternates } from "next/font/google";
import Provider from "@/components/ui/provider";
import { AuthProvider } from "@/providers/AuthProvider";
import "./globals.css";

const montserratAlternates = Montserrat_Alternates({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat-alternates",
  display: "swap",
});

export const metadata: Metadata = {
  title: "La U del Futuro 2026 · UTPton",
  description:
    "Encuentro, reactivación y solidaridad. Conoce la programación de La U del Futuro 2026 y apoya a la comunidad UTP con una donación voluntaria a UTPton.",
  icons: [
    { url: "/favicon.ico", media: "(prefers-color-scheme: light)" },
    { url: "/favicon.ico", media: "(prefers-color-scheme: dark)" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={montserratAlternates.variable}
    >
      <body>
        <Provider>
          <AuthProvider>
            {children}
          </AuthProvider>

          <Toaster richColors />
        </Provider>
      </body>
    </html>
  );
}
