import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: {
    default: "GSPB CS — Classroom coding platform",
    template: "%s | GSPB CS",
  },
  description: "Browser-based CS classrooms for schools.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
        <body className="min-h-dvh font-sans antialiased">
          <SiteHeader />
          <main>{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}
