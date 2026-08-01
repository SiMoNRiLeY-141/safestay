"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { collection, deleteDoc, doc, onSnapshot, setDoc, updateDoc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
export type GuestStatus = "Unknown" | "Safe" | "Need Help";
export interface Room { id: string; name: string; guestStatus: GuestStatus; helpType?: string | null; helpIntensity?: "high" | "medium" | "low" | null; floor?: string; gridCol?: number; gridRow?: number; }
interface Value { rooms: Room[]; firestoreError: string | null; addRoom(room: Room): Promise<void>; updateRoom(id: string, updates: Partial<Room>): Promise<void>; deleteRoom(id: string): Promise<void>; deleteRooms(ids: string[]): Promise<void>; resetStatuses(): Promise<void>; }
const Context = createContext<Value | null>(null);
export function RoomProvider({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAuth(); const [rooms, setRooms] = useState<Room[]>([]); const [firestoreError, setFirestoreError] = useState<string | null>(null);
  useEffect(() => { if (loading || !isAdmin) return; return onSnapshot(collection(db, "rooms"), snap => { setFirestoreError(null); setRooms(snap.docs.map(item => item.data() as Room).sort((a,b) => a.name.localeCompare(b.name, undefined, { numeric: true }))); }, () => setFirestoreError("Live room updates are unavailable. Please retry.")); }, [isAdmin, loading]);
  async function run(action: () => Promise<void>) { try { await action(); } catch (error) { setFirestoreError(error instanceof Error ? error.message : "The change could not be saved."); throw error; } }
  return <Context.Provider value={{ rooms: isAdmin ? rooms : [], firestoreError,
    addRoom: room => run(() => setDoc(doc(db,"rooms",room.id),room)), updateRoom: (id, updates) => run(() => updateDoc(doc(db,"rooms",id),updates)), deleteRoom: id => run(() => deleteDoc(doc(db,"rooms",id))),
    deleteRooms: ids => run(async () => { const batch = writeBatch(db); ids.forEach(id => batch.delete(doc(db,"rooms",id))); await batch.commit(); }),
    resetStatuses: () => run(async () => { const batch=writeBatch(db); rooms.forEach(room => batch.update(doc(db,"rooms",room.id),{guestStatus:"Unknown",helpType:null,helpIntensity:null})); await batch.commit(); })
  }}>{children}</Context.Provider>;
}
export function useRooms() { const value = useContext(Context); if (!value) throw new Error("useRooms must be used within a RoomProvider"); return value; }
