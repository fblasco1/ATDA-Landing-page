import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "ATDA - Asociación Tecnológica por el Desarrollo Argentino",
  description:
    "Promovemos debates estratégicos para la transformación productiva y tecnológica de la Argentina.",
  icons: { icon: "/favicon.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${montserrat.className} bg-gray-900 text-gray-200 antialiased`}>{children}</body>
    </html>
  );
}
