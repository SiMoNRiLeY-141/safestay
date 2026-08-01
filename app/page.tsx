"use client";

import { useState } from "react";
import { Info, X } from "lucide-react";
import { PropertyDetails } from "@/app/components/PropertyDetails";
import { useTheme } from "@/context/ThemeContext";

export default function GuestPortal() {
  const { theme, toggleTheme } = useTheme();
  const [showInfo, setShowInfo] = useState(false);
  return <main className="min-h-screen flex items-center justify-center p-6 relative">
    <button onClick={() => setShowInfo(!showInfo)} className="absolute top-4 left-4 p-2 cyber-panel rounded-lg" aria-label="Property information"><Info /></button>
    <button onClick={toggleTheme} className="absolute top-4 right-4 p-2 cyber-panel rounded-lg" aria-label="Toggle dark mode">{theme === "light" ? "🌙" : "☀️"}</button>
    <section className="max-w-md text-center cyber-panel rounded-2xl p-8 border-t-2 border-cyan-500/50">
      <h1 className="text-3xl font-black text-cyan-700 dark:text-cyan-400 uppercase tracking-widest">SafeStay</h1>
      <p className="mt-4 text-cyan-900 dark:text-cyan-100">Scan the QR code issued for your stay to report that you are safe or request help.</p>
      <p className="mt-3 text-sm text-cyan-700 dark:text-cyan-400">For privacy and safety, room status cannot be submitted from this shared page.</p>
    </section>
    {showInfo && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"><div className="relative max-w-md w-full"><button onClick={() => setShowInfo(false)} className="absolute right-2 top-2 z-10 p-2 bg-red-500 text-white rounded-full" aria-label="Close"><X /></button><PropertyDetails /></div></div>}
  </main>;
}
