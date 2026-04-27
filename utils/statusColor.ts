import type { GuestStatus } from "@/context/RoomContext";

export function statusColor(
  status: GuestStatus,
  intensity?: "high" | "medium" | "low" | null
): string {
  if (status === "Safe")
    return "bg-emerald-100 dark:bg-emerald-500/80 text-emerald-800 dark:text-white border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] dark:shadow-[0_0_15px_rgba(16,185,129,0.5)]";
  if (status === "Need Help") {
    if (intensity === "high")
      return "bg-red-100 dark:bg-red-600/90 text-red-800 dark:text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] dark:shadow-[0_0_20px_rgba(220,38,38,0.8)] border-red-500 animate-pulse cyber-glitch";
    if (intensity === "medium")
      return "bg-orange-100 dark:bg-orange-500/80 text-orange-800 dark:text-white shadow-[0_0_15px_rgba(249,115,22,0.4)] dark:shadow-[0_0_15px_rgba(249,115,22,0.6)] border-orange-400";
    if (intensity === "low")
      return "bg-amber-100 dark:bg-amber-400/80 text-amber-900 dark:text-gray-900 shadow-[0_0_10px_rgba(251,191,36,0.4)] dark:shadow-[0_0_10px_rgba(251,191,36,0.6)] border-amber-300";
    return "bg-red-100 dark:bg-red-500/80 text-red-800 dark:text-white border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)] dark:shadow-[0_0_15px_rgba(239,68,68,0.5)]";
  }
  return "bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-cyan-500 border-slate-300 dark:border-cyan-800/50 shadow-[inset_0_0_10px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_0_10px_rgba(6,182,212,0.1)]";
}
