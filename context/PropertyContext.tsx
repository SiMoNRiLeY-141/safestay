"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Property {
  id: string;
  name: string;
  type: "hotel" | "hospital" | "other";
  address: string;
  phone: string;
  emergencyContacts: {
    name: string;
    phone: string;
    role: string;
  }[];
  latitude?: number;
  longitude?: number;
}

interface PropertyContextValue {
  property: Property | null;
  loading: boolean;
  updateProperty: (updates: Partial<Property>) => Promise<void>;
}

const PropertyContext = createContext<PropertyContextValue | null>(null);

export function PropertyProvider({ children }: { children: React.ReactNode }) {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const propertyRef = doc(db, "property", "main");
        const snapshot = await getDoc(propertyRef);

        if (snapshot.exists()) {
          setProperty(snapshot.data() as Property);
        } else setProperty(null);
      } catch (error) {
        console.error("Failed to fetch property:", error);
        setProperty(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, []);

  async function updateProperty(updates: Partial<Property>) {
    if (!property) return;

    const updatedProperty = { ...property, ...updates };
    setProperty(updatedProperty);

    try {
      const propertyRef = doc(db, "property", "main");
      await updateDoc(propertyRef, updates);
    } catch (error) {
      console.error("Failed to update property:", error);
      setProperty(property);
      throw error;
    }
  }

  return (
    <PropertyContext.Provider value={{ property, loading, updateProperty }}>
      {children}
    </PropertyContext.Provider>
  );
}

export function useProperty() {
  const context = useContext(PropertyContext);
  if (!context) {
    throw new Error("useProperty must be used within PropertyProvider");
  }
  return context;
}
