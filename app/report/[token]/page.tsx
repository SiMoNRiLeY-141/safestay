"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

const OPTIONS = [
  ["fire", "Fire / Smoke"], ["gas", "Gas Leak"], ["threat", "Active Threat"],
  ["medical", "Medical / First Aid"], ["trapped", "Trapped"], ["meds", "Critical Medicines"],
  ["food", "Water + Food"], ["flood", "Water Leakage"], ["electrical", "Electrical Faults"], ["other", "Other Help"],
] as const;

export default function RoomReport() {
  const { token } = useParams<{ token: string }>();
  const [help, setHelp] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  async function submit(status: "Safe" | "Need Help", helpType?: string) {
    setState("sending"); setMessage("");
    try {
      const response = await fetch("/api/guest/status", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, status, helpType }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to send your status.");
      setState("success"); setMessage(status === "Safe" ? "Your safety status was sent." : "Your request for help was sent.");
    } catch (error) { setState("error"); setMessage(error instanceof Error ? error.message : "Unable to send your status."); }
  }
  return <main className="min-h-screen flex items-center justify-center p-6"><section className="w-full max-w-md cyber-panel rounded-2xl p-6 text-center"><h1 className="text-3xl font-black text-cyan-700 dark:text-cyan-400">SafeStay</h1><p className="mt-2">Report your current status.</p>{!help ? <div className="mt-6 grid gap-4"><button disabled={state === "sending"} onClick={() => submit("Safe")} className="rounded-xl bg-emerald-600 p-4 font-bold text-white disabled:opacity-50">I AM SAFE</button><button disabled={state === "sending"} onClick={() => setHelp(true)} className="rounded-xl bg-red-600 p-4 font-bold text-white disabled:opacity-50">NEED ASSISTANCE</button></div> : <div className="mt-6 grid gap-2">{OPTIONS.map(([id, label]) => <button disabled={state === "sending"} key={id} onClick={() => submit("Need Help", id)} className="rounded-xl border border-red-300 p-3 text-left font-semibold hover:bg-red-50 dark:hover:bg-red-950/40">{label}</button>)}<button onClick={() => setHelp(false)} className="mt-2 text-sm underline">Back</button></div>}{state === "sending" && <p className="mt-4">Sending…</p>}{message && <p role="status" className={`mt-4 ${state === "error" ? "text-red-600" : "text-emerald-600"}`}>{message}</p>}{state === "error" && <button onClick={() => setState("idle")} className="mt-2 underline">Try again</button>}</section></main>;
}
