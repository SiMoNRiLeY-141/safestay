"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { collection, onSnapshot, doc, setDoc, updateDoc, getDocs, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";

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
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    const roomsRef = collection(db, "rooms");

    // Listen to real-time updates
    const unsubscribe = onSnapshot(roomsRef, async (snapshot) => {
      if (snapshot.empty && !isSeeding) {
        setIsSeeding(true);
        // Seed initial data if collection is empty
        try {
          const batch = writeBatch(db);
          initialRooms.forEach((room) => {
            const roomDocRef = doc(db, "rooms", room.roomNumber.toString());
            batch.set(roomDocRef, room);
          });
          await batch.commit();
          console.log("Seeded initial rooms to Firestore.");
        } catch (error) {
          console.error("Failed to seed initial rooms:", error);
        } finally {
          setIsSeeding(false);
        }
      } else {
        const fetchedRooms: Room[] = [];
        snapshot.forEach((docSnap) => {
          fetchedRooms.push(docSnap.data() as Room);
        });
        // Sort rooms by roomNumber
        fetchedRooms.sort((a, b) => a.roomNumber - b.roomNumber);
        if (fetchedRooms.length > 0) {
          setRooms(fetchedRooms);
        }
      }
    });

    return () => unsubscribe();
  }, [isSeeding]);

  async function updateStatus(roomNumber: number, status: GuestStatus) {
    // Optimistic UI update
    setRooms((prev) =>
      prev.map((room) =>
        room.roomNumber === roomNumber ? { ...room, guestStatus: status } : room
      )
    );

    try {
      const roomDocRef = doc(db, "rooms", roomNumber.toString());
      await updateDoc(roomDocRef, { guestStatus: status });
    } catch (error) {
      console.error("Error updating room status in Firestore:", error);
    }
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
