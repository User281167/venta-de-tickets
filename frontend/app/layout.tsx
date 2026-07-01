import type { Metadata } from "next";
import { Toaster } from "sonner";
import Provider from "@/components/ui/provider";
import { AuthProvider } from "@/providers/AuthProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Future Minds 2026",
  description:
    "Una experiencia única con expertos en tecnología, emprendimiento e innovación dentro del campus universitario.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <Provider>
          <AuthProvider>{children}</AuthProvider>
          <Toaster richColors />
        </Provider>
      </body>
    </html>
  );
}
