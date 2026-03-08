import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { LanguageProvider } from "@/lib/i18n";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vandara - Text-Based RPG",
  description: "Immersive text-based RPG experience. Build your character, explore the city, and become a legend.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-background via-background to-muted/20`}
      >
        <TooltipProvider delayDuration={200}>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </TooltipProvider>
        <Toaster richColors position="top-center" theme="dark" />
      </body>
    </html>
  );
}
