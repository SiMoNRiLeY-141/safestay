"use client";

import { useState } from "react";
import { useRooms, GuestStatus } from "@/context/RoomContext";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

function statusColor(status: GuestStatus): string {
  switch (status) {
    case "Safe":
      return "bg-green-500 text-white";
    case "Need Help":
      return "bg-red-500 text-white";
    default:
      return "bg-gray-300 text-gray-700";
  }
}

export default function AdminDashboard() {
  const { rooms, addRoom, updateRoom, deleteRoom, deleteRooms, resetStatuses } = useRooms();
  const { signOut } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

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
      const roomDataStr = rooms.map(r => `Room ${r.name} (Floor: ${r.floor || 'Ground Floor'}) - Status: ${r.guestStatus}`).join('\n');
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
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              SafeStay – Admin Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Hotel Crisis Response · Ottapalam, Kerala
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleAskAI}
              disabled={isGenerating}
              className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-colors ${
                isGenerating ? "bg-purple-100 text-purple-400 cursor-not-allowed" : "bg-purple-100 text-purple-700 hover:bg-purple-200"
              }`}
            >
              {isGenerating ? "Generating..." : "Ask AI"}
            </button>
            <button
              onClick={handleResetStatuses}
              className="text-sm px-3 py-1.5 rounded-lg font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
            >
              Reset Statuses
            </button>
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`text-sm px-3 py-1.5 rounded-lg transition-colors font-medium ${
                isEditMode ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-700 hover:bg-blue-200"
              }`}
            >
              {isEditMode ? "Done Editing" : "Edit Layout"}
            </button>
            <Link
              href="/"
              className="text-sm text-gray-600 underline hover:text-gray-800"
            >
              ← Guest Portal
            </Link>
            <button
              onClick={signOut}
              className="text-sm px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Summary bar */}
        {!isEditMode && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-300 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-gray-700">{unknownCount}</p>
              <p className="text-sm text-gray-600 font-medium">Unknown</p>
            </div>
            <div className="bg-green-500 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-white">{safeCount}</p>
              <p className="text-sm text-white font-medium">Safe</p>
            </div>
            <div className="bg-red-500 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-white">{helpCount}</p>
              <p className="text-sm text-white font-medium">Need Help</p>
            </div>
          </div>
        )}

        {aiResponse && !isEditMode && (
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 mb-8 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-bold text-purple-900 flex items-center gap-2">
                ✨ AI Situation Summary
              </h2>
              <button 
                onClick={() => setAiResponse(null)}
                className="text-purple-400 hover:text-purple-600 font-bold text-xl leading-none"
              >
                &times;
              </button>
            </div>
            <div className="text-sm text-purple-800 whitespace-pre-wrap leading-relaxed">
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
          <div className="flex flex-col gap-8">
            {floors.map(floor => {
              const floorRooms = rooms.filter(r => (r.floor || "Ground Floor") === floor);
              const floorMaxCol = Math.max(10, ...floorRooms.map(r => r.gridCol || 1));
              return (
                <div key={floor}>
                  <h2 className="text-xl font-bold text-gray-800 mb-3">{floor}</h2>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div 
                      className="grid gap-3"
                      style={{
                        gridTemplateColumns: `repeat(${floorMaxCol}, minmax(60px, 1fr))`
                      }}
                    >
                      {floorRooms.map((room) => (
                        <div
                          key={room.id}
                          className={`rounded-xl flex flex-col items-center justify-center p-3 shadow-sm transition-transform duration-300 hover:scale-105 cursor-default ${statusColor(
                            room.guestStatus
                          )}`}
                          style={{
                            gridColumn: room.gridCol ? room.gridCol : 'auto',
                            gridRow: room.gridRow ? room.gridRow : 'auto',
                          }}
                        >
                          <span className="text-lg font-bold truncate w-full text-center">{room.name}</span>
                          <span className="text-xs font-medium mt-1 text-center leading-tight">
                            {room.guestStatus}
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
          <div className="flex gap-6 mt-8 items-center justify-center text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-gray-300 inline-block shadow-sm" />
              Unknown
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-green-500 inline-block shadow-sm" />
              Safe
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-red-500 inline-block shadow-sm" />
              Need Help
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
