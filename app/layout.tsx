import type { Metadata } from "next";
import { Orbitron, Rajdhani } from "next/font/google";
import "./globals.css";
import { RoomProvider } from "@/context/RoomContext";
import { ThemeProvider } from "@/context/ThemeContext";

const orbitron = Orbitron({ subsets: ["latin"], variable: "--font-orbitron" });
const rajdhani = Rajdhani({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-rajdhani" });

export const metadata: Metadata = {
  title: "SafeStay – Rapid Crisis Response",
  description: "Hotel crisis response system for SafeStay, Ottapalam, Kerala",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${orbitron.variable} ${rajdhani.variable} font-sans antialiased bg-[#f0f8ff] dark:bg-[#050b14] text-[#003b4d] dark:text-cyan-50 transition-colors duration-300 min-h-screen futuristic-grid`}>
        <ThemeProvider>
          <RoomProvider>{children}</RoomProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
