import type { Metadata } from "next";
import { Toaster } from "sonner";
import { Montserrat_Alternates } from "next/font/google";
import Provider from "@/components/ui/provider";
import { AuthProvider } from "@/providers/AuthProvider";
import "./globals.css";
import { CartProvider } from "@/providers/CartProvider";

const montserratAlternates = Montserrat_Alternates({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat-alternates",
  display: "swap",
});

export const metadata: Metadata = {
  title: "La Convención 2026",
  description:
    "Una experiencia única con expertos en tecnología, emprendimiento e innovación dentro del campus universitario.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning className={montserratAlternates.variable}>
      <body>
        <Provider>
          <AuthProvider>
            <CartProvider>{children}</CartProvider>
          </AuthProvider>

          <Toaster richColors />
        </Provider>
      </body>
    </html>
  );
}
