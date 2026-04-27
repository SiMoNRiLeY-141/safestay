"use client";

import { useState } from "react";
import { useProperty, Property } from "@/context/PropertyContext";
import { Save, Plus, Trash2, X } from "lucide-react";

export function PropertyManagement() {
  const { property, updateProperty, loading } = useProperty();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Property | null>(null);

  const handleEdit = () => {
    if (property) {
      setFormData({ ...property });
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setFormData(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!formData) return;
    await updateProperty(formData);
    setIsEditing(false);
    setFormData(null);
  };

  const handleChange = (field: keyof Property, value: any) => {
    if (formData) {
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleContactChange = (index: number, field: string, value: string) => {
    if (formData) {
      const newContacts = [...formData.emergencyContacts];
      newContacts[index] = { ...newContacts[index], [field]: value };
      setFormData({ ...formData, emergencyContacts: newContacts });
    }
  };

  const handleAddContact = () => {
    if (formData) {
      setFormData({
        ...formData,
        emergencyContacts: [
          ...formData.emergencyContacts,
          { name: "", phone: "", role: "" },
        ],
      });
    }
  };

  const handleRemoveContact = (index: number) => {
    if (formData) {
      setFormData({
        ...formData,
        emergencyContacts: formData.emergencyContacts.filter(
          (_, i) => i !== index
        ),
      });
    }
  };

  if (loading) {
    return (
      <div className="cyber-panel rounded-xl p-6 border border-cyan-500/30">
        <div className="text-center text-cyan-600 dark:text-cyan-400">
          Loading property information...
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="cyber-panel rounded-xl p-6 border border-red-500/30">
        <div className="text-center text-red-600 dark:text-red-400">
          Property information unavailable
        </div>
      </div>
    );
  }

  if (!isEditing) {
    return (
      <div className="cyber-panel rounded-xl p-6 border border-cyan-500/30 space-y-4">
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4">
          <h2 className="text-xl font-bold text-cyan-700 dark:text-cyan-400">
            Property Information
          </h2>
          <button
            onClick={handleEdit}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-semibold transition-colors"
          >
            Edit
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs uppercase tracking-widest text-cyan-600 dark:text-cyan-500 font-mono font-bold">
              Property Name
            </label>
            <p className="text-lg font-semibold text-cyan-900 dark:text-cyan-100 mt-1">
              {property.name}
            </p>
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest text-cyan-600 dark:text-cyan-500 font-mono font-bold">
              Type
            </label>
            <p className="text-lg font-semibold text-cyan-900 dark:text-cyan-100 mt-1 capitalize">
              {property.type}
            </p>
          </div>

          <div className="md:col-span-2">
            <label className="text-xs uppercase tracking-widest text-cyan-600 dark:text-cyan-500 font-mono font-bold">
              Address
            </label>
            <p className="text-sm text-cyan-900 dark:text-cyan-100 mt-1">
              {property.address}
            </p>
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest text-cyan-600 dark:text-cyan-500 font-mono font-bold">
              Phone
            </label>
            <p className="text-sm text-cyan-900 dark:text-cyan-100 mt-1">
              {property.phone}
            </p>
          </div>
        </div>

        {property.emergencyContacts.length > 0 && (
          <div>
            <label className="text-xs uppercase tracking-widest text-red-600 dark:text-red-400 font-mono font-bold">
              Emergency Contacts
            </label>
            <div className="space-y-2 mt-2">
              {property.emergencyContacts.map((contact, idx) => (
                <div key={idx} className="bg-red-500/10 border border-red-500/20 rounded p-3">
                  <p className="font-semibold text-sm text-red-700 dark:text-red-300">
                    {contact.name}
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {contact.role}
                  </p>
                  <p className="text-sm font-mono text-red-600 dark:text-red-400">
                    {contact.phone}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="cyber-panel rounded-xl p-6 border border-cyan-500/30 space-y-4 max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4">
        <h2 className="text-xl font-bold text-cyan-700 dark:text-cyan-400">
          Edit Property Information
        </h2>
        <button
          onClick={handleCancel}
          className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-600 dark:text-red-400"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {formData && (
        <div className="space-y-4">
          {/* Basic Info */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-cyan-600 dark:text-cyan-500 font-mono font-bold mb-2">
              Property Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-cyan-300 dark:border-cyan-800/50 bg-white/80 dark:bg-[#050b14]/80 text-cyan-900 dark:text-cyan-50 focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-cyan-600 dark:text-cyan-500 font-mono font-bold mb-2">
                Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  handleChange(
                    "type",
                    e.target.value as "hotel" | "hospital" | "other"
                  )
                }
                className="w-full px-4 py-2 rounded-lg border border-cyan-300 dark:border-cyan-800/50 bg-white/80 dark:bg-[#050b14]/80 text-cyan-900 dark:text-cyan-50 focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400"
              >
                <option value="hotel">Hotel</option>
                <option value="hospital">Hospital</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-cyan-600 dark:text-cyan-500 font-mono font-bold mb-2">
                Phone *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-cyan-300 dark:border-cyan-800/50 bg-white/80 dark:bg-[#050b14]/80 text-cyan-900 dark:text-cyan-50 focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-cyan-600 dark:text-cyan-500 font-mono font-bold mb-2">
              Address *
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-cyan-300 dark:border-cyan-800/50 bg-white/80 dark:bg-[#050b14]/80 text-cyan-900 dark:text-cyan-50 focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400"
            />
          </div>

          {/* Emergency Contacts */}
          <div className="border-t border-red-500/20 pt-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs uppercase tracking-widest text-red-600 dark:text-red-400 font-mono font-bold">
                Emergency Contacts
              </label>
              <button
                onClick={handleAddContact}
                className="flex items-center gap-1 px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
            <div className="space-y-3">
              {formData.emergencyContacts.map((contact, idx) => (
                <div key={idx} className="bg-red-500/10 border border-red-500/20 rounded p-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={contact.name}
                      onChange={(e) =>
                        handleContactChange(idx, "name", e.target.value)
                      }
                      placeholder="Name"
                      className="px-3 py-1 rounded text-sm border border-red-300 dark:border-red-800/50 bg-white/80 dark:bg-[#050b14]/80 text-red-900 dark:text-red-50 focus:outline-none focus:border-red-500 dark:focus:border-red-400"
                    />
                    <input
                      type="text"
                      value={contact.role}
                      onChange={(e) =>
                        handleContactChange(idx, "role", e.target.value)
                      }
                      placeholder="Role"
                      className="px-3 py-1 rounded text-sm border border-red-300 dark:border-red-800/50 bg-white/80 dark:bg-[#050b14]/80 text-red-900 dark:text-red-50 focus:outline-none focus:border-red-500 dark:focus:border-red-400"
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      value={contact.phone}
                      onChange={(e) =>
                        handleContactChange(idx, "phone", e.target.value)
                      }
                      placeholder="Phone"
                      className="flex-1 px-3 py-1 rounded text-sm border border-red-300 dark:border-red-800/50 bg-white/80 dark:bg-[#050b14]/80 text-red-900 dark:text-red-50 focus:outline-none focus:border-red-500 dark:focus:border-red-400"
                    />
                    <button
                      onClick={() => handleRemoveContact(idx)}
                      className="p-1 hover:bg-red-500/20 rounded transition-colors text-red-600 dark:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 border-t border-cyan-500/20 pt-4">
            <button
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
            >
              <Save className="w-5 h-5" />
              Save Changes
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 px-4 py-3 bg-slate-400 hover:bg-slate-500 text-white rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
