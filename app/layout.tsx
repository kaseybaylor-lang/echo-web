import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Echo: Speak with Confidence",
  description:
    "AI-powered communication coaching for the next generation of leaders. Track eye contact, pacing, and filler words in real time.",
  keywords: ["public speaking", "communication coaching", "AI", "confidence"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} h-full`}>
      <body className="min-h-full bg-[#0A0A0A] text-[#F0F0F0] antialiased noise">
        {children}
      </body>
    </html>
  );
}
