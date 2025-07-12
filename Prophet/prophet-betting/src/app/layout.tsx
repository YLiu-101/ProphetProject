import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import WeaverBackground from "@/components/WeaverBackground";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Prophet - Prediction Markets",
  description: "Trade on the future. Create and bet on prediction markets with AI arbitration.",
  keywords: ["prediction markets", "betting", "AI", "trading", "future"],
  authors: [{ name: "Prophet" }],
  creator: "Prophet",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://prophet.bet",
    title: "Prophet - Prediction Markets",
    description: "Trade on the future. Create and bet on prediction markets with AI arbitration.",
    siteName: "Prophet",
  },
  twitter: {
    card: "summary_large_image",
    title: "Prophet - Prediction Markets",
    description: "Trade on the future. Create and bet on prediction markets with AI arbitration.",
    creator: "@prophet",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <WeaverBackground />
        <div className="min-h-screen">
          <Navigation />
          <main className="relative">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
