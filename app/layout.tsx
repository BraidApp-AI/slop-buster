import type { Metadata } from "next";
import { JetBrains_Mono, Space_Mono } from "next/font/google";
import "./globals.css";

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "slop-buster / sweep the vercel graveyard",
  description:
    "Audit and delete abandoned Vercel projects before their API keys leak.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${jetbrains.variable} ${spaceMono.variable}`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
