"use client";

import { useState, useEffect, useRef } from "react";
import { useRooms } from "@/context/RoomContext";
import { useTheme } from "@/context/ThemeContext";
import { PropertyDetails } from "@/app/components/PropertyDetails";
import { 
  Flame, CloudRainWind, ShieldAlert, HeartPulse, 
  Lock, Pill, Utensils, Waves, Zap, AlertCircle, 
  CheckCircle, ShieldPlus, Info, X
} from "lucide-react";

type Intensity = "high" | "medium" | "low";

interface EmergencyOption {
  id: string;
  label: string;
  intensity: Intensity;
  icon: React.ReactNode;
}

const EMERGENCY_OPTIONS: EmergencyOption[] = [
  { id: "fire", label: "Fire / Smoke", intensity: "high", icon: <Flame className="w-6 h-6" /> },
  { id: "gas", label: "Gas Leak", intensity: "high", icon: <CloudRainWind className="w-6 h-6" /> },
  { id: "threat", label: "Active Threat", intensity: "high", icon: <ShieldAlert className="w-6 h-6" /> },
  { id: "medical", label: "Medical / First Aid", intensity: "medium", icon: <HeartPulse className="w-6 h-6" /> },
  { id: "trapped", label: "Trapped", intensity: "medium", icon: <Lock className="w-6 h-6" /> },
  { id: "meds", label: "Critical Medicines", intensity: "medium", icon: <Pill className="w-6 h-6" /> },
  { id: "food", label: "Water + Food", intensity: "low", icon: <Utensils className="w-6 h-6" /> },
  { id: "flood", label: "Water Leakage", intensity: "low", icon: <Waves className="w-6 h-6" /> },
  { id: "electrical", label: "Electrical Faults", intensity: "low", icon: <Zap className="w-6 h-6" /> },
  { id: "other", label: "Other Help", intensity: "low", icon: <AlertCircle className="w-6 h-6" /> },
];

export default function GuestPortal() {
  const { rooms, updateStatus } = useRooms();
  const { theme, toggleTheme } = useTheme();
  const [selectedRoom, setSelectedRoom] = useState<string>("1");
  const [submitted, setSubmitted] = useState<"Safe" | "Need Help" | null>(null);
  const [showEmergencyOptions, setShowEmergencyOptions] = useState(false);
  const [showPropertyInfo, setShowPropertyInfo] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  function handleSafe() {
    updateStatus(selectedRoom, "Safe");
    setShowEmergencyOptions(false);
    showSuccessMessage("Safe");
  }

  function handleEmergency(option: EmergencyOption) {
    updateStatus(selectedRoom, "Need Help", option.label, option.intensity);
    setShowEmergencyOptions(false);
    showSuccessMessage("Need Help");
  }

  function showSuccessMessage(status: "Safe" | "Need Help") {
    setSubmitted(status);
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => setSubmitted(null), 4000);
  }

  const selectedRoomObj = rooms.find(r => r.id === selectedRoom);

  return (
    <main className="min-h-screen bg-transparent flex flex-col items-center justify-center px-4 py-8 sm:py-10 transition-colors duration-300 relative">
      {/* Property Info Button */}
      <button
        onClick={() => setShowPropertyInfo(!showPropertyInfo)}
        className="absolute top-4 left-4 p-2 rounded-lg cyber-panel text-cyan-700 dark:text-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-300 transition-all z-10"
        aria-label="Toggle Property Information"
        title="Property Information"
      >
        <Info className="w-6 h-6" />
      </button>
      {/* Dark Mode Toggle */}
      <button 
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 rounded-lg cyber-panel text-cyan-700 dark:text-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-300 transition-all z-10"
        aria-label="Toggle Dark Mode"
      >
        {theme === "light" ? "🌙" : "☀️"}
      </button>

      <div className="w-full max-w-md cyber-panel border-t-2 border-t-cyan-500/50 rounded-2xl p-6 sm:p-8 flex flex-col items-center gap-6 transition-all duration-300 relative overflow-hidden">
        {/* Decorative cyber lines */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
        <div className="absolute -left-10 top-20 w-32 h-[1px] bg-cyan-500/30 rotate-45"></div>
        <div className="absolute -right-10 bottom-20 w-32 h-[1px] bg-cyan-500/30 rotate-45"></div>

        <div className="text-center relative z-10">
          <h1 className="text-3xl sm:text-4xl font-black text-cyan-700 dark:text-cyan-400 tracking-[0.15em] font-[family-name:var(--font-orbitron)] uppercase drop-shadow-sm dark:drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]">SafeStay</h1>
          <p className="text-xs sm:text-sm text-cyan-800 dark:text-cyan-600 mt-2 uppercase tracking-widest font-mono font-bold">
            Rapid Crisis Response
          </p>
        </div>

        <div className="w-full">
          <label
            htmlFor="room-select"
            className="block text-xs font-bold text-cyan-700 dark:text-cyan-500 uppercase tracking-widest mb-2 font-mono"
          >
            Select your room
          </label>
          <div className="relative">
            <select
              id="room-select"
              value={selectedRoom}
              onChange={(e) => {
                setSelectedRoom(e.target.value);
                setSubmitted(null);
                setShowEmergencyOptions(false);
              }}
              className="w-full appearance-none rounded-xl border border-cyan-300 dark:border-cyan-800/50 bg-white/80 dark:bg-[#050b14]/80 px-4 py-3.5 text-cyan-900 dark:text-cyan-50 text-lg focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,150,255,0.2)] dark:focus:shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all font-mono backdrop-blur-md"
            >
            {Array.from(new Set(rooms.map(r => r.floor || "Ground Floor"))).sort().map(floor => (
              <optgroup key={floor} label={floor}>
                {rooms.filter(r => (r.floor || "Ground Floor") === floor).map(room => (
                  <option key={room.id} value={room.id}>
                    Room {room.name}
                  </option>
                ))}
              </optgroup>
            ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-cyan-500">
              ▼
            </div>
          </div>
        </div>

        {!showEmergencyOptions ? (
          <div className="w-full flex flex-col gap-4 mt-2">
            <button
              onClick={handleSafe}
              className="group relative overflow-hidden w-full py-4 sm:py-5 rounded-2xl text-white text-lg sm:text-xl font-bold bg-gradient-to-b from-emerald-400 to-emerald-600 shadow-[0_8px_16px_rgba(16,185,129,0.3),inset_0_2px_4px_rgba(255,255,255,0.4)] active:scale-[0.98] transition-all flex items-center justify-center gap-3 border border-emerald-500 hover:shadow-[0_12px_20px_rgba(16,185,129,0.4),inset_0_2px_4px_rgba(255,255,255,0.5)] before:absolute before:inset-0 before:bg-white/20 before:opacity-0 hover:before:opacity-100 before:transition-opacity"
            >
              <CheckCircle className="w-7 h-7 drop-shadow-md" /> 
              <span className="drop-shadow-md tracking-wide">I AM SAFE</span>
            </button>
            <button
              onClick={() => setShowEmergencyOptions(true)}
              className="group relative overflow-hidden w-full py-4 sm:py-5 rounded-2xl text-white text-lg sm:text-xl font-bold bg-gradient-to-b from-red-500 to-red-700 shadow-[0_8px_16px_rgba(239,68,68,0.4),inset_0_2px_4px_rgba(255,255,255,0.3)] active:scale-[0.98] transition-all flex items-center justify-center gap-3 border border-red-600 hover:shadow-[0_12px_20px_rgba(239,68,68,0.5),inset_0_2px_4px_rgba(255,255,255,0.4)] before:absolute before:inset-0 before:bg-white/20 before:opacity-0 hover:before:opacity-100 before:transition-opacity"
            >
              <ShieldPlus className="w-7 h-7 drop-shadow-md" /> 
              <span className="drop-shadow-md tracking-wide">NEED ASSISTANCE</span>
            </button>
          </div>
        ) : (
          <div className="w-full flex flex-col gap-3 animate-in fade-in duration-300 mt-2">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-bold text-cyan-800 dark:text-cyan-400 uppercase tracking-widest font-mono">What kind of help?</h2>
              <button
                onClick={() => setShowEmergencyOptions(false)}
                className="text-xs font-bold text-slate-500 hover:text-cyan-700 dark:hover:text-cyan-400 transition-colors uppercase tracking-wider"
              >
                Cancel
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 max-h-[60vh] sm:max-h-80 overflow-y-auto p-1 scrollbar-hide">
              {EMERGENCY_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => handleEmergency(opt)}
                  className={`group flex items-center gap-3 p-3.5 rounded-2xl border backdrop-blur-md transition-all active:scale-[0.98] shadow-sm hover:shadow-md ${
                      opt.intensity === 'high' ? 'bg-gradient-to-br from-red-50/90 to-red-100/60 dark:from-red-900/40 dark:to-red-900/20 border-red-200/50 dark:border-red-800/50 text-red-900 dark:text-red-100 hover:border-red-300 dark:hover:border-red-700' :
                      opt.intensity === 'medium' ? 'bg-gradient-to-br from-orange-50/90 to-orange-100/60 dark:from-orange-900/40 dark:to-orange-900/20 border-orange-200/50 dark:border-orange-800/50 text-orange-900 dark:text-orange-100 hover:border-orange-300 dark:hover:border-orange-700' :
                      'bg-gradient-to-br from-amber-50/90 to-amber-100/60 dark:from-yellow-900/30 dark:to-yellow-900/10 border-amber-200/50 dark:border-yellow-800/50 text-amber-900 dark:text-yellow-100 hover:border-amber-300 dark:hover:border-yellow-700'
                    }`}
                >
                  <div className={`p-2 rounded-xl bg-white/10 shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)] transition-transform group-hover:scale-110`}>
                    {opt.icon}
                  </div>
                  <span className="text-xs sm:text-sm font-bold uppercase tracking-wider leading-tight flex-1 text-left">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {submitted && selectedRoomObj && (
          <div
            className={`w-full text-center py-3 px-4 rounded-xl font-bold text-white border backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.5)] ${submitted === "Safe" ? "bg-emerald-500/80 border-emerald-400" : "bg-red-600/80 border-red-500 cyber-glitch"
              }`}
          >
            {submitted === "Safe"
              ? `Room ${selectedRoomObj.name} marked as Safe ✓`
              : `Help requested for Room ${selectedRoomObj.name} ✓`}
          </div>
        )}

        <p className="text-[10px] text-cyan-700 dark:text-cyan-700/80 text-center font-bold font-mono tracking-widest mt-2 uppercase">
          Your status will be sent to the front desk immediately.
        </p>
      </div>

      {/* Property Information Modal */}
      {showPropertyInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 sm:py-10 bg-black/40 backdrop-blur-sm">
          <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="absolute -top-4 -right-4 z-10">
              <button
                onClick={() => setShowPropertyInfo(false)}
                className="p-2 rounded-full bg-red-500/90 hover:bg-red-600 text-white transition-all shadow-lg"
                aria-label="Close Property Information"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <PropertyDetails />
          </div>
        </div>
      )}
    </main>
  );
}
