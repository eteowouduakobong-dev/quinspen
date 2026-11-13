import React, { Suspense } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QuinspenProvider } from "@/context/QuinspenContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AuthModal } from "@/components/AuthModal";
import { SanctuaryEntryGate } from "@/components/SanctuaryEntryGate";
import { LayoutShell } from "@/components/LayoutShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QUINSPEN • Anonymous Storytelling Sanctuary",
  description:
    "Share your raw, authentic stories anonymously without exposing your identity. Connect with other souls, exchange whispers, and maintain your personal chronicle in complete privacy.",
  keywords: [
    "anonymous storytelling",
    "quinspen",
    "confessions",
    "creative writing",
    "empathy",
    "private journal",
    "whispers",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-stone-950 text-stone-100 selection:bg-amber-500/30 selection:text-amber-200">
        <QuinspenProvider>
          <Suspense fallback={<div className="h-16 bg-stone-950 border-b border-stone-800" />}>
            <Navbar />
          </Suspense>
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
          <AuthModal />
          <SanctuaryEntryGate />
          <LayoutShell />
        </QuinspenProvider>
      </body>
    </html>
  );
}
