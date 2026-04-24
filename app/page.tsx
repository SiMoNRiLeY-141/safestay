"use client";

import { useState, useEffect, useRef } from "react";
import { useRooms } from "@/context/RoomContext";

export default function GuestPortal() {
  const { rooms, updateStatus } = useRooms();
  const [selectedRoom, setSelectedRoom] = useState<string>("1");
  const [submitted, setSubmitted] = useState<"Safe" | "Need Help" | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  function handleStatus(status: "Safe" | "Need Help") {
    updateStatus(selectedRoom, status);
    setSubmitted(status);
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => setSubmitted(null), 3000);
  }

  const selectedRoomObj = rooms.find(r => r.id === selectedRoom);

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center gap-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">SafeStay</h1>
          <p className="text-sm text-gray-500 mt-1">
            Rapid Crisis Response · Ottapalam, Kerala
          </p>
        </div>

        <div className="w-full">
          <label
            htmlFor="room-select"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Select your room
          </label>
          <select
            id="room-select"
            value={selectedRoom}
            onChange={(e) => {
              setSelectedRoom(e.target.value);
              setSubmitted(null);
            }}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-800 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        </div>

        <div className="w-full flex flex-col gap-4">
          <button
            onClick={() => handleStatus("Safe")}
            className="w-full py-5 rounded-xl text-white text-xl font-bold bg-green-500 active:bg-green-700 hover:bg-green-600 transition-colors shadow-md"
          >
            ✅ I AM SAFE
          </button>
          <button
            onClick={() => handleStatus("Need Help")}
            className="w-full py-5 rounded-xl text-white text-xl font-bold bg-red-500 active:bg-red-700 hover:bg-red-600 transition-colors shadow-md"
          >
            🆘 NEED ASSISTANCE
          </button>
        </div>

        {submitted && selectedRoomObj && (
          <div
            className={`w-full text-center py-3 rounded-lg font-semibold text-white ${
              submitted === "Safe" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {submitted === "Safe"
              ? `Room ${selectedRoomObj.name} marked as Safe ✓`
              : `Help requested for Room ${selectedRoomObj.name} ✓`}
          </div>
        )}

        <p className="text-xs text-gray-400 text-center">
          Your status will be sent to the front desk immediately.
        </p>
      </div>
    </main>
  );
}
