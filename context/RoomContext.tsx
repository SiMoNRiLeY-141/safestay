"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type GuestStatus = "Unknown" | "Safe" | "Need Help";

export interface Room {
  roomNumber: number;
  guestStatus: GuestStatus;
}

interface RoomContextValue {
  rooms: Room[];
  updateStatus: (roomNumber: number, status: GuestStatus) => void;
}

const RoomContext = createContext<RoomContextValue | null>(null);

const initialRooms: Room[] = Array.from({ length: 30 }, (_, i) => ({
  roomNumber: i + 1,
  guestStatus: "Unknown",
}));

export function RoomProvider({ children }: { children: React.ReactNode }) {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [isMounted, setIsMounted] = useState(false);

  // Load from localStorage on initial mount
  useEffect(() => {
    setIsMounted(true);
    const storedRooms = localStorage.getItem("safestay_rooms");
    if (storedRooms) {
      try {
        setRooms(JSON.parse(storedRooms));
      } catch (e) {
        console.error("Failed to parse stored rooms", e);
      }
    }
  }, []);

  // Save to localStorage whenever rooms change
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("safestay_rooms", JSON.stringify(rooms));
    }
  }, [rooms, isMounted]);

  // Listen for changes from other tabs to sync in real-time
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "safestay_rooms" && e.newValue) {
        try {
          setRooms(JSON.parse(e.newValue));
        } catch (e) {
          console.error("Failed to parse stored rooms from storage event", e);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  function updateStatus(roomNumber: number, status: GuestStatus) {
    setRooms((prev) =>
      prev.map((room) =>
        room.roomNumber === roomNumber ? { ...room, guestStatus: status } : room
      )
    );
  }

  return (
    <RoomContext.Provider value={{ rooms, updateStatus }}>
      {children}
    </RoomContext.Provider>
  );
}

export function useRooms(): RoomContextValue {
  const ctx = useContext(RoomContext);
  if (!ctx) throw new Error("useRooms must be used within a RoomProvider");
  return ctx;
}
