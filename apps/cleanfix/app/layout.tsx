import { Metadata } from "next";
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
  title: "KobiPro — KOBİ Yönetim Platformu",
  description:
    "KobiPro, temizlik, inşaat, berber, restoran ve daha birçok sektör için KOBİ yönetim platformu. Randevu, müşteri, personel, fatura ve raporlama.",
  keywords: [
    "KOBİ",
    "SaaS",
    "temizlik",
    "inşaat",
    "randevu yönetimi",
    "fatura",
    "personel",
    "Belçika",
    "Hollanda",
  ],
  authors: [{ name: "KobiPro" }],
  openGraph: {
    title: "KobiPro — KOBİ Yönetim Platformu",
    description: "Sektöre özel SaaS çözümleri. 9 sektör, tek platform.",
    type: "website",
    locale: "tr_TR",
  },
  twitter: {
    card: "summary_large_image",
    title: "KobiPro",
    description: "KOBİ Yönetim Platformu",
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100">
        {children}
      </body>
    </html>
  );
}
