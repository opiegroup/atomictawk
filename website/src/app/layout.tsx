import type { Metadata } from "next";
import { Oswald, Space_Grotesk, Courier_Prime } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const courierPrime = Courier_Prime({
  variable: "--font-courier-prime",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Atomic Tawk - Tawk Loud. Drive Louder. Feel Prouder.",
  description: "A retro-futuristic media brand for car culture, burnouts, shed builds, tools, gaming, and bloke culture. Official Mechanical Broadcast.",
  keywords: ["cars", "burnouts", "gaming", "shed builds", "tools", "mechanical", "automotive"],
  openGraph: {
    title: "Atomic Tawk - Tawk Loud. Drive Louder. Feel Prouder.",
    description: "Official Mechanical Broadcast for the mechanically inclined.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${oswald.variable} ${spaceGrotesk.variable} ${courierPrime.variable} antialiased min-h-screen flex flex-col`}
        style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
      >
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
