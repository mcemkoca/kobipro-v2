import {
  ClerkProvider,
} from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "KobiPro v2 — CleanFix",
  description: "Cleaning business management platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#18181b",
          colorBackground: "#ffffff",
          colorText: "#18181b",
        },
        layout: {
          logoPlacement: "inside",
          socialButtonsVariant: "iconButton",
        },
      }}
    >
      <html
        lang="tr"
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-slate-950 text-slate-100">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
