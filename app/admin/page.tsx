"use client";

import { useState, useEffect, useRef } from "react";
import { useRooms, GuestStatus } from "@/context/RoomContext";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import Link from "next/link";

function statusColor(status: GuestStatus, intensity?: "high" | "medium" | "low" | null): string {
  if (status === "Safe") return "bg-emerald-100 dark:bg-emerald-500/80 text-emerald-800 dark:text-white border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] dark:shadow-[0_0_15px_rgba(16,185,129,0.5)]";
  if (status === "Need Help") {
    if (intensity === "high") return "bg-red-100 dark:bg-red-600/90 text-red-800 dark:text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] dark:shadow-[0_0_20px_rgba(220,38,38,0.8)] border-red-500 animate-pulse cyber-glitch";
    if (intensity === "medium") return "bg-orange-100 dark:bg-orange-500/80 text-orange-800 dark:text-white shadow-[0_0_15px_rgba(249,115,22,0.4)] dark:shadow-[0_0_15px_rgba(249,115,22,0.6)] border-orange-400";
    if (intensity === "low") return "bg-amber-100 dark:bg-amber-400/80 text-amber-900 dark:text-gray-900 shadow-[0_0_10px_rgba(251,191,36,0.4)] dark:shadow-[0_0_10px_rgba(251,191,36,0.6)] border-amber-300";
    return "bg-red-100 dark:bg-red-500/80 text-red-800 dark:text-white border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)] dark:shadow-[0_0_15px_rgba(239,68,68,0.5)]";
  }
  return "bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-cyan-500 border-slate-300 dark:border-cyan-800/50 shadow-[inset_0_0_10px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_0_10px_rgba(6,182,212,0.1)]";
}

export default function AdminDashboard() {
  const { rooms, addRoom, updateRoom, deleteRoom, deleteRooms, resetStatuses } = useRooms();
  const { signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [notifications, setNotifications] = useState<{id: string, room: string, type: string}[]>([]);

  const prevRoomsRef = useRef(rooms);

  useEffect(() => {
    if (prevRoomsRef.current.length > 0) {
      const newEmergencies = rooms.filter(room => 
        room.guestStatus === "Need Help" && 
        prevRoomsRef.current.find(r => r.id === room.id)?.guestStatus !== "Need Help"
      );

      if (newEmergencies.length > 0) {
        try {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const playBeep = (timeOffset: number) => {
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            oscillator.type = "square";
            oscillator.frequency.setValueAtTime(800, audioCtx.currentTime + timeOffset);
            gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime + timeOffset);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + timeOffset + 0.2);
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            oscillator.start(audioCtx.currentTime + timeOffset);
            oscillator.stop(audioCtx.currentTime + timeOffset + 0.2);
          };
          playBeep(0);
          playBeep(0.3);
          playBeep(0.6);
        } catch (e) {
          console.error("Audio playback failed", e);
        }

        newEmergencies.forEach(room => {
          const id = Math.random().toString();
          setNotifications(prev => [...prev, {id, room: room.name, type: room.helpType || "Unknown Emergency"}]);
          setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
          }, 8000);
        });
      }
    }
    prevRoomsRef.current = rooms;
  }, [rooms]);

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const floors = Array.from(new Set(rooms.map(r => r.floor || "Ground Floor"))).sort();

  const safeCount = rooms.filter((r) => r.guestStatus === "Safe").length;
  const helpCount = rooms.filter((r) => r.guestStatus === "Need Help").length;
  const unknownCount = rooms.filter((r) => r.guestStatus === "Unknown").length;

  const handleAddRoom = () => {
    const newId = Date.now().toString();
    addRoom({
      id: newId,
      name: "New Room",
      guestStatus: "Unknown",
      floor: "Ground Floor",
    });
  };

  const handleResetStatuses = () => {
    if (confirm("Are you sure you want to reset all room statuses to 'Unknown'?")) {
      resetStatuses();
    }
  };

  const handleDeleteSelected = () => {
    if (confirm(`Are you sure you want to delete ${selectedRooms.length} selected room(s)?`)) {
      deleteRooms(selectedRooms);
      setSelectedRooms([]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedRooms.length === rooms.length) {
      setSelectedRooms([]);
    } else {
      setSelectedRooms(rooms.map(r => r.id));
    }
  };

  const toggleSelectRoom = (id: string) => {
    setSelectedRooms(prev => 
      prev.includes(id) ? prev.filter(rId => rId !== id) : [...prev, id]
    );
  };

  const handleAskAI = async () => {
    setIsGenerating(true);
    setAiResponse(null);
    try {
      const roomDataStr = rooms.map(r => `Room ${r.name} (Floor: ${r.floor || 'Ground Floor'}) - Status: ${r.guestStatus}${r.helpType ? ` - Need: ${r.helpType}` : ''}`).join('\n');
      const prompt = `You are an expert crisis management AI. Here is the current real-time status of our hotel rooms:\n${roomDataStr}\n\nPlease analyze the situation, identify any critical clusters of emergencies, and suggest a priority action plan for the responders. Keep it concise.`;

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAiResponse(data.result);
    } catch (err: any) {
      alert(err.message || "Something went wrong.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="min-h-screen bg-transparent p-4 sm:p-6 transition-colors duration-300">
      {/* Notifications Overlay */}
      <div className="fixed top-24 right-4 z-50 flex flex-col gap-3 pointer-events-none w-72 sm:w-80">
        {notifications.map(n => (
          <div key={n.id} className="pointer-events-auto bg-red-50 dark:bg-[#050b14]/90 border-2 border-red-500 rounded-xl p-4 shadow-[0_0_20px_rgba(220,38,38,0.5)] animate-in slide-in-from-right-full fade-in duration-300 cyber-glitch backdrop-blur-md">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-red-700 dark:text-red-400 font-bold uppercase tracking-widest font-mono text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                Alert
              </h3>
              <button onClick={() => dismissNotification(n.id)} className="text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors">
                ✕
              </button>
            </div>
            <p className="text-red-900 dark:text-white font-bold text-sm">
              Room {n.room} requires immediate assistance!
            </p>
            <p className="text-red-700 dark:text-red-300 text-xs mt-1 font-mono uppercase">
              Incident: {n.type}
            </p>
          </div>
        ))}
      </div>

      <div className="max-w-[1400px] mx-auto w-full">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 cyber-panel p-4 lg:p-5 rounded-2xl">
          <div className="shrink-0">
            <h1 className="text-xl md:text-2xl font-bold text-cyan-800 dark:text-cyan-400 tracking-widest font-[family-name:var(--font-orbitron)] uppercase">
              SafeStay – Admin
            </h1>
            <p className="text-[10px] md:text-xs text-cyan-900 dark:text-cyan-600 mt-1 uppercase tracking-widest font-mono">
              Hotel Crisis Response · Ottapalam
            </p>
          </div>
          <div className="flex flex-wrap xl:flex-nowrap items-center gap-2 sm:gap-3 w-full lg:w-auto lg:justify-end">
            <button 
              onClick={toggleTheme}
              className="p-1.5 md:p-2 rounded-lg cyber-panel text-cyan-700 dark:text-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-300 hover:shadow-[0_0_10px_rgba(0,150,255,0.5)] dark:hover:shadow-[0_0_10px_rgba(0,240,255,0.5)] transition-all shrink-0"
              aria-label="Toggle Dark Mode"
            >
              {theme === "light" ? "🌙" : "☀️"}
            </button>
            <button
              onClick={handleAskAI}
              disabled={isGenerating}
              className={`text-[10px] md:text-xs px-3 py-1.5 rounded-lg font-bold tracking-wider uppercase transition-all border shrink-0 ${
                isGenerating ? "bg-purple-100 dark:bg-purple-900/40 text-purple-400 dark:text-purple-500 border-purple-300 dark:border-purple-800 cursor-not-allowed" : "bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 border-purple-400 dark:border-purple-500 hover:bg-purple-200 dark:hover:bg-purple-800 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] dark:hover:shadow-[0_0_15px_rgba(168,85,247,0.5)]"
              }`}
            >
              {isGenerating ? "Analyzing..." : "Ask AI"}
            </button>
            <button
              onClick={handleResetStatuses}
              className="text-[10px] md:text-xs px-3 py-1.5 rounded-lg font-bold tracking-wider uppercase bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 border border-red-400 dark:border-red-800 hover:bg-red-200 dark:hover:bg-red-800 hover:text-red-900 dark:hover:text-red-200 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] dark:hover:shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-all shrink-0"
            >
              Reset Statuses
            </button>
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`text-[10px] md:text-xs px-3 py-1.5 rounded-lg font-bold tracking-wider uppercase transition-all border shrink-0 ${
                isEditMode ? "bg-cyan-600 text-white border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.6)]" : "bg-cyan-100 dark:bg-cyan-900/40 text-cyan-800 dark:text-cyan-400 border-cyan-400 dark:border-cyan-800 hover:bg-cyan-200 dark:hover:bg-cyan-800 hover:text-cyan-900 dark:hover:text-cyan-200 hover:shadow-[0_0_15px_rgba(0,150,255,0.4)] dark:hover:shadow-[0_0_15px_rgba(6,182,212,0.4)]"
              }`}
            >
              {isEditMode ? "Done Editing" : "Edit Layout"}
            </button>
            <Link
              href="/"
              className="text-[10px] md:text-xs px-2 text-cyan-800 dark:text-cyan-600 hover:text-cyan-600 dark:hover:text-cyan-300 tracking-wider uppercase font-bold transition-colors shrink-0 whitespace-nowrap"
            >
              ← Guest Portal
            </Link>
            <button
              onClick={signOut}
              className="text-[10px] md:text-xs px-3 py-1.5 bg-slate-200 dark:bg-slate-800 border border-slate-400 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white rounded-lg tracking-wider uppercase font-bold transition-all shrink-0"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Summary bar */}
        {!isEditMode && (
          <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-8">
            <div className="cyber-panel rounded-xl p-4 sm:p-5 text-center border-t-4 border-t-cyan-500 dark:border-t-cyan-600">
              <p className="text-2xl sm:text-3xl font-bold text-cyan-700 dark:text-cyan-400 font-mono">{unknownCount}</p>
              <p className="text-xs sm:text-sm text-cyan-800 dark:text-cyan-600 font-bold uppercase tracking-widest mt-1">Unknown</p>
            </div>
            <div className="cyber-panel rounded-xl p-4 sm:p-5 text-center border-t-4 border-t-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <p className="text-2xl sm:text-3xl font-bold text-emerald-400 font-mono">{safeCount}</p>
              <p className="text-xs sm:text-sm text-emerald-500 font-bold uppercase tracking-widest mt-1">Safe</p>
            </div>
            <div className="cyber-panel rounded-xl p-4 sm:p-5 text-center border-t-4 border-t-red-600 shadow-[0_0_20px_rgba(220,38,38,0.3)]">
              <p className="text-2xl sm:text-3xl font-bold text-red-500 font-mono">{helpCount}</p>
              <p className="text-xs sm:text-sm text-red-500 font-bold uppercase tracking-widest mt-1">Need Help</p>
            </div>
          </div>
        )}

        {aiResponse && !isEditMode && (
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/50 rounded-xl p-4 sm:p-6 mb-8 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-bold text-purple-900 dark:text-purple-300 flex items-center gap-2">
                ✨ AI Situation Summary
              </h2>
              <button 
                onClick={() => setAiResponse(null)}
                className="text-purple-400 dark:text-purple-500 hover:text-purple-600 dark:hover:text-purple-400 font-bold text-xl leading-none"
              >
                &times;
              </button>
            </div>
            <div className="text-sm text-purple-800 dark:text-purple-200 whitespace-pre-wrap leading-relaxed">
              {aiResponse}
            </div>
          </div>
        )}

        {/* Edit Mode */}
        {isEditMode ? (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Room Configuration</h2>
              <div className="flex gap-3">
                {selectedRooms.length > 0 && (
                  <button
                    onClick={handleDeleteSelected}
                    className="px-4 py-2 bg-red-500 text-white text-sm font-bold rounded hover:bg-red-600 transition-colors"
                  >
                    Delete Selected ({selectedRooms.length})
                  </button>
                )}
                <button
                  onClick={handleAddRoom}
                  className="px-4 py-2 bg-green-500 text-white text-sm font-bold rounded hover:bg-green-600 transition-colors"
                >
                  + Add Room
                </button>
              </div>
            </div>
            <div className="overflow-x-auto max-h-[60vh]">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-white shadow-sm z-10">
                  <tr className="border-b text-sm text-gray-500">
                    <th className="py-3 px-4 w-12">
                      <input 
                        type="checkbox" 
                        checked={rooms.length > 0 && selectedRooms.length === rooms.length}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                    </th>
                    <th className="py-3 px-4 font-semibold">Name / Number</th>
                    <th className="py-3 px-4 font-semibold">Floor</th>
                    <th className="py-3 px-4 font-semibold">Grid Column (X)</th>
                    <th className="py-3 px-4 font-semibold">Grid Row (Y)</th>
                    <th className="py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((room) => (
                    <tr key={room.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <input 
                          type="checkbox"
                          checked={selectedRooms.includes(room.id)}
                          onChange={() => toggleSelectRoom(room.id)}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={room.name}
                          onChange={(e) => updateRoom(room.id, { name: e.target.value })}
                          className="border border-gray-300 rounded-lg px-3 py-1.5 w-full max-w-[200px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={room.floor || ""}
                          onChange={(e) => updateRoom(room.id, { floor: e.target.value })}
                          className="border border-gray-300 rounded-lg px-3 py-1.5 w-full max-w-[150px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          placeholder="Ground Floor"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          value={room.gridCol || ""}
                          onChange={(e) => updateRoom(room.id, { gridCol: e.target.value ? parseInt(e.target.value) : undefined })}
                          className="border border-gray-300 rounded-lg px-3 py-1.5 w-24 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          placeholder="Auto"
                          min="1"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          value={room.gridRow || ""}
                          onChange={(e) => updateRoom(room.id, { gridRow: e.target.value ? parseInt(e.target.value) : undefined })}
                          className="border border-gray-300 rounded-lg px-3 py-1.5 w-24 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          placeholder="Auto"
                          min="1"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete room ${room.name}?`)) {
                              deleteRoom(room.id);
                            }
                          }}
                          className="text-red-500 hover:text-red-700 text-sm font-semibold transition-colors px-2 py-1 rounded hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-500 mt-6 border-t pt-4">
              <strong className="text-gray-700">Tip:</strong> Use Grid Column and Row to visually position rooms on the dashboard. 
              Leaving them empty ("Auto") will place rooms sequentially in any available spots.
            </p>
          </div>
        ) : (
          /* Live Room Grid */
          <div className="flex flex-col gap-6 sm:gap-8">
            {floors.map(floor => {
              const floorRooms = rooms.filter(r => (r.floor || "Ground Floor") === floor);
              const floorMaxCol = Math.max(10, ...floorRooms.map(r => r.gridCol || 1));
              return (
                <div key={floor}>
                  <h2 className="text-xl sm:text-2xl font-bold text-cyan-800 dark:text-cyan-300 mb-4 font-[family-name:var(--font-orbitron)] tracking-wider uppercase border-b border-cyan-300 dark:border-cyan-800/50 pb-2 inline-block shadow-[0_4px_10px_rgba(6,182,212,0.0)]">{floor}</h2>
                  <div className="cyber-panel p-5 sm:p-8 rounded-2xl transition-colors">
                    <div 
                      className="grid gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide"
                      style={{
                        gridTemplateColumns: `repeat(${floorMaxCol}, minmax(60px, 1fr))`
                      }}
                    >
                      {floorRooms.map((room) => (
                        <div
                          key={room.id}
                          className={`rounded-xl flex flex-col items-center justify-center p-4 transition-all duration-300 hover:scale-110 cursor-default border-2 backdrop-blur-md ${statusColor(
                            room.guestStatus,
                            room.helpIntensity
                          )}`}
                          style={{
                            gridColumn: room.gridCol ? room.gridCol : 'auto',
                            gridRow: room.gridRow ? room.gridRow : 'auto',
                          }}
                        >
                          <span className="text-xl font-black truncate w-full text-center font-mono tracking-widest">{room.name}</span>
                          <span className="text-[10px] font-bold mt-2 text-center leading-tight line-clamp-2 uppercase tracking-wider opacity-90">
                            {room.helpType || room.guestStatus}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Legend */}
        {!isEditMode && (
          <div className="flex flex-wrap gap-4 md:gap-8 mt-12 items-center justify-center text-xs sm:text-sm text-cyan-800 dark:text-cyan-600 font-bold uppercase tracking-widest bg-white/80 dark:bg-[#050b14]/80 p-4 rounded-xl border border-cyan-300 dark:border-cyan-900/50 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <span className="w-4 h-4 rounded-sm border border-slate-300 dark:border-cyan-800 bg-slate-100 dark:bg-slate-800/60 shadow-[inset_0_0_8px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_0_8px_rgba(6,182,212,0.2)]" />
              Unknown
            </div>
            <div className="flex items-center gap-3">
              <span className="w-4 h-4 rounded-sm border border-emerald-400 bg-emerald-100 dark:bg-emerald-500/80 shadow-[0_0_10px_rgba(16,185,129,0.3)] dark:shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              Safe
            </div>
            <div className="flex items-center gap-3">
              <span className="w-4 h-4 rounded-sm border border-amber-300 bg-amber-100 dark:bg-amber-400/80 shadow-[0_0_10px_rgba(251,191,36,0.3)] dark:shadow-[0_0_10px_rgba(251,191,36,0.6)]" />
              Low Priority Help
            </div>
            <div className="flex items-center gap-3">
              <span className="w-4 h-4 rounded-sm border border-orange-400 bg-orange-100 dark:bg-orange-500/80 shadow-[0_0_10px_rgba(249,115,22,0.3)] dark:shadow-[0_0_10px_rgba(249,115,22,0.6)]" />
              Urgent Help
            </div>
            <div className="flex items-center gap-3">
              <span className="w-4 h-4 rounded-sm border border-red-500 bg-red-100 dark:bg-red-600/90 shadow-[0_0_15px_rgba(220,38,38,0.4)] dark:shadow-[0_0_15px_rgba(220,38,38,0.8)] animate-pulse" />
              Critical Emergency
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
