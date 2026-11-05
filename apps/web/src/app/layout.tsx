import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { frFR } from "@clerk/localizations";
import { DM_Mono, DM_Sans, Newsreader } from "next/font/google";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteNav } from "@/components/marketing/site-nav";
import "./globals.css";

const sans = DM_Sans({ subsets: ["latin"], variable: "--font-dm" });
const mono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-dm-mono" });
const display = Newsreader({ subsets: ["latin"], variable: "--font-newsreader" });

export const metadata: Metadata = {
  title: {
    default: "GSPB — L'IDE en ligne pour votre classe",
    template: "%s · GSPB",
  },
  description:
    "Un IDE dans le navigateur pour les cours d'informatique. Les élèves rejoignent avec un lien. Le tarif est par classe, élèves illimités.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider localization={frFR}>
      <html lang="fr" className={`${sans.variable} ${mono.variable} ${display.variable}`}>
        <body className="min-h-dvh bg-paper font-sans text-ink-soft antialiased">
          <SiteNav />
          <main>{children}</main>
          <SiteFooter />
        </body>
      </html>
    </ClerkProvider>
  );
}
