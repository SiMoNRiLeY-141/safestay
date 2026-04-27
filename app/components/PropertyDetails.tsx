"use client";

import { useProperty } from "@/context/PropertyContext";
import { Phone, MapPin, AlertCircle } from "lucide-react";

export function PropertyDetails() {
  const { property, loading } = useProperty();

  if (loading) {
    return (
      <div className="w-full max-w-md cyber-panel rounded-2xl p-6 border border-cyan-500/30">
        <div className="text-center text-cyan-600 dark:text-cyan-400">
          Loading property information...
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="w-full max-w-md cyber-panel rounded-2xl p-6 border border-red-500/30">
        <div className="text-center text-red-600 dark:text-red-400">
          Property information unavailable
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full cyber-panel rounded-2xl p-6 border border-cyan-500/30 space-y-4 overflow-x-hidden">
      {/* Property Header */}
      <div className="text-center border-b border-cyan-500/20 pb-4">
        <h2 className="text-2xl font-bold text-cyan-700 dark:text-cyan-400 mb-1">
          {property.name}
        </h2>
        <p className="text-xs uppercase tracking-widest text-cyan-600 dark:text-cyan-500 font-mono">
          {property.type === "hotel" && "🏨 Hotel"}
          {property.type === "hospital" && "🏥 Hospital"}
          {property.type === "other" && "📍 Property"}
        </p>
      </div>

      {/* Essential Contact Information */}
      <div className="space-y-3 border-t border-cyan-500/20 pt-4">
        {property.address && (
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-cyan-600 dark:text-cyan-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-cyan-700 dark:text-cyan-300 break-words">{property.address}</div>
          </div>
        )}

        {property.phone && (
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-cyan-600 dark:text-cyan-400 flex-shrink-0" />
            <a
              href={`tel:${property.phone}`}
              className="text-sm text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 underline font-semibold"
            >
              {property.phone}
            </a>
          </div>
        )}
      </div>

      {/* Emergency Contacts */}
      {property.emergencyContacts && property.emergencyContacts.length > 0 && (
        <div className="border-t border-red-500/20 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
            <p className="text-xs uppercase tracking-widest text-red-600 dark:text-red-400 font-mono font-bold">
              Emergency Contacts
            </p>
          </div>
          <div className="space-y-2">
            {property.emergencyContacts.map((contact, index) => (
              <div key={index} className="bg-red-500/10 border border-red-500/20 rounded p-3">
                <div className="font-semibold text-sm text-red-700 dark:text-red-300">
                  {contact.name}
                </div>
                <div className="text-xs text-red-600 dark:text-red-400 mb-1">
                  {contact.role}
                </div>
                <a
                  href={`tel:${contact.phone}`}
                  className="text-sm font-mono text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 font-semibold break-all"
                >
                  {contact.phone}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
