import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "KobiPro UI",
  description: "Shared UI components for KobiPro",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
