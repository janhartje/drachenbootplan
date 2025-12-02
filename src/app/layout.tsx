import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";

import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Drachenboot Manager - Team & Bootsbesetzung Planen",
    template: "%s | Drachenboot Manager"
  },
  description: "Plane dein Drachenboot-Team effizient: Mitgliederverwaltung, Terminplanung und optimale Bootsbesetzung mit KI-Unterstützung. Funktioniert offline als installierbare App.",
  keywords: ["Drachenboot", "Team Management", "Bootsbesetzung", "Trainingsplanung", "Paddler", "Dragon Boat", "PWA", "Offline App"],
  authors: [{ name: "Jan Hartje" }],
  creator: "Jan Hartje",
  publisher: "Jan Hartje",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "de_DE",
    alternateLocale: ["en_US"],
    url: "/",
    title: "Drachenboot Manager - Team & Bootsbesetzung Planen",
    description: "Plane dein Drachenboot-Team effizient: Mitgliederverwaltung, Terminplanung und optimale Bootsbesetzung mit KI-Unterstützung.",
    siteName: "Drachenboot Manager",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Drachenboot Manager - Dein Team perfekt organisiert",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Drachenboot Manager - Team & Bootsbesetzung Planen",
    description: "Plane dein Drachenboot-Team effizient mit KI-Unterstützung. Offline-fähige Progressive Web App.",
    images: ["/opengraph-image.png"],
    creator: "@drachenbootplan",
  },
  manifest: "/manifest.json",
  icons: {
    icon: '/favicon.svg',
    apple: '/icons/logo-192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Drachenboot Manager",
  },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className={inter.className} suppressHydrationWarning>
        <LanguageProvider>
          {children}
          <Analytics />
          <SpeedInsights />
        </LanguageProvider>
      </body>
    </html>
  );
}
