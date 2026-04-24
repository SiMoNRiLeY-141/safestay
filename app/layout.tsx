import type { Metadata } from "next";
import "./globals.css";
import { RoomProvider } from "@/context/RoomContext";

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
    <html lang="en">
      <body className="antialiased">
        <RoomProvider>{children}</RoomProvider>
      </body>
    </html>
  );
}
