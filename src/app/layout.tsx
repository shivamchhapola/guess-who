import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "GuessWhoParty! — Free Custom Guess Who Online",
  description:
    "Play Guess Who online with your own photos, The Office, Marvel heroes, or any custom character set. No login needed to play. Make a game set from your own photos in seconds!",
  keywords: ["guess who", "online game", "custom board game", "party game", "multiplayer"],
  openGraph: {
    title: "GuessWhoParty! — Free Custom Guess Who Online",
    description: "Play with friends using custom photos, The Office characters, Marvel heroes and more. No login required!",
    type: "website",
  },
};

interface LayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
