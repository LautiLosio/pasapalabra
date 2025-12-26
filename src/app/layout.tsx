import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Pasapalabra - Control de Juego",
  description: "Consola de control para el juego Pasapalabra con generación de preguntas por IA",
  manifest: "/manifest.json",
  themeColor: "#9333ea",
  icons: {
    icon: [
      { url: "/pasapalabra-logo-1024.png", sizes: "any" },
      { url: "/pasapalabra-logo-1024.png", type: "image/png" },
    ],
    apple: "/pasapalabra-logo-1024.png",
    shortcut: "/pasapalabra-logo-1024.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Pasapalabra",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${fredoka.variable} ${nunito.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
