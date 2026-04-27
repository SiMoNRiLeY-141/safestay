"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { collection, onSnapshot, doc, setDoc, updateDoc, getDocs, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type GuestStatus = "Unknown" | "Safe" | "Need Help";

export interface Room {
  id: string;
  name: string;
  guestStatus: GuestStatus;
  helpType?: string | null;
  helpIntensity?: "high" | "medium" | "low" | null;
  floor?: string;
  gridCol?: number;
  gridRow?: number;
}

interface RoomContextValue {
  rooms: Room[];
  updateStatus: (id: string, status: GuestStatus, helpType?: string | null, helpIntensity?: "high" | "medium" | "low" | null) => void;
  addRoom: (room: Room) => Promise<void>;
  updateRoom: (id: string, updates: Partial<Room>) => Promise<void>;
  deleteRoom: (id: string) => Promise<void>;
  deleteRooms: (ids: string[]) => Promise<void>;
  resetStatuses: () => Promise<void>;
}

const RoomContext = createContext<RoomContextValue | null>(null);

const initialRooms: Room[] = Array.from({ length: 30 }, (_, i) => ({
  id: (i + 1).toString(),
  name: (i + 1).toString(),
  guestStatus: "Unknown",
  floor: "Ground Floor",
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
            const roomDocRef = doc(db, "rooms", room.id);
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
        // Sort rooms by name (numeric if possible, otherwise alphabetical)
        fetchedRooms.sort((a, b) => {
          const aName = a.name || "";
          const bName = b.name || "";
          const aNum = parseInt(aName);
          const bNum = parseInt(bName);
          if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
          return aName.localeCompare(bName);
        });
        if (fetchedRooms.length > 0) {
          setRooms(fetchedRooms);
        }
      }
    });

    return () => unsubscribe();
  }, [isSeeding]);

  async function updateStatus(id: string, status: GuestStatus, helpType: string | null = null, helpIntensity: "high" | "medium" | "low" | null = null) {
    // Optimistic UI update
    setRooms((prev) =>
      prev.map((room) =>
        room.id === id ? { ...room, guestStatus: status, helpType, helpIntensity } : room
      )
    );

    try {
      const roomDocRef = doc(db, "rooms", id);
      const updates: any = { guestStatus: status };
      if (status === "Need Help") {
        updates.helpType = helpType;
        updates.helpIntensity = helpIntensity;
      } else {
        updates.helpType = null;
        updates.helpIntensity = null;
      }
      await updateDoc(roomDocRef, updates);
    } catch (error) {
      console.error("Error updating room status in Firestore:", error);
    }
  }

  async function addRoom(room: Room) {
    try {
      const roomDocRef = doc(db, "rooms", room.id);
      await setDoc(roomDocRef, room);
    } catch (error) {
      console.error("Error adding room:", error);
    }
  }

  async function updateRoom(id: string, updates: Partial<Room>) {
    try {
      const roomDocRef = doc(db, "rooms", id);
      await updateDoc(roomDocRef, updates);
    } catch (error) {
      console.error("Error updating room:", error);
    }
  }

  async function deleteRoom(id: string) {
    // Optimistically update
    setRooms((prev) => prev.filter((room) => room.id !== id));
    try {
      const { deleteDoc } = await import("firebase/firestore");
      const roomDocRef = doc(db, "rooms", id);
      await deleteDoc(roomDocRef);
    } catch (error) {
      console.error("Error deleting room:", error);
    }
  }

  async function resetStatuses() {
    // Optimistic UI update
    setRooms((prev) => prev.map((room) => ({ ...room, guestStatus: "Unknown", helpType: null, helpIntensity: null })));
    
    try {
      const batch = writeBatch(db);
      rooms.forEach((room) => {
        const roomDocRef = doc(db, "rooms", room.id);
        batch.update(roomDocRef, { guestStatus: "Unknown", helpType: null, helpIntensity: null });
      });
      await batch.commit();
    } catch (error) {
      console.error("Error resetting room statuses:", error);
    }
  }

  async function deleteRooms(ids: string[]) {
    // Optimistically update
    setRooms((prev) => prev.filter((room) => !ids.includes(room.id)));
    try {
      const { deleteDoc } = await import("firebase/firestore");
      // Use batch or loop, loop is fine for small numbers
      const batch = writeBatch(db);
      ids.forEach(id => {
        const roomDocRef = doc(db, "rooms", id);
        batch.delete(roomDocRef);
      });
      await batch.commit();
    } catch (error) {
      console.error("Error deleting rooms:", error);
    }
  }

  return (
    <RoomContext.Provider value={{ rooms, updateStatus, addRoom, updateRoom, deleteRoom, deleteRooms, resetStatuses }}>
      {children}
    </RoomContext.Provider>
  );
}

export function useRooms(): RoomContextValue {
  const ctx = useContext(RoomContext);
  if (!ctx) throw new Error("useRooms must be used within a RoomProvider");
  return ctx;
}
