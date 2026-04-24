"use client";

import { useRooms, GuestStatus } from "@/context/RoomContext";
import Link from "next/link";

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
  const { rooms } = useRooms();

  const safeCount = rooms.filter((r) => r.guestStatus === "Safe").length;
  const helpCount = rooms.filter((r) => r.guestStatus === "Need Help").length;
  const unknownCount = rooms.filter((r) => r.guestStatus === "Unknown").length;

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
          <Link
            href="/"
            className="text-sm text-blue-600 underline hover:text-blue-800"
          >
            ← Guest Portal
          </Link>
        </div>

        {/* Summary bar */}
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

        {/* Room grid */}
        <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-3">
          {rooms.map((room) => (
            <div
              key={room.roomNumber}
              className={`rounded-xl flex flex-col items-center justify-center p-3 shadow-sm transition-colors duration-300 ${statusColor(
                room.guestStatus
              )}`}
            >
              <span className="text-lg font-bold">{room.roomNumber}</span>
              <span className="text-xs font-medium mt-1 text-center leading-tight">
                {room.guestStatus}
              </span>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex gap-6 mt-8 items-center justify-center text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-gray-300 inline-block" />
            Unknown
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-green-500 inline-block" />
            Safe
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-red-500 inline-block" />
            Need Help
          </div>
        </div>
      </div>
    </main>
  );
}
