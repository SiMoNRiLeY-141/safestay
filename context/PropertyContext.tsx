"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
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

const DEFAULT_PROPERTY: Property = {
  id: "default",
  name: "Property Name",
  type: "hotel",
  address: "123 Main Street, City, Country",
  phone: "+1 (555) 000-0000",
  emergencyContacts: [
    { name: "Main Office", phone: "+1 (555) 000-0001", role: "Reception" },
  ],
  latitude: 0,
  longitude: 0,
};

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
        } else {
          // Set default property if it doesn't exist
          await setDoc(propertyRef, DEFAULT_PROPERTY);
          setProperty(DEFAULT_PROPERTY);
        }
      } catch (error) {
        console.error("Failed to fetch property:", error);
        setProperty(DEFAULT_PROPERTY);
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
      // Revert on error
      setProperty(property);
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
