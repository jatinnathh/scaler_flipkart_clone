"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { INDIAN_STATES, ADDRESS_TYPES } from "@/lib/constants";
import { FiUser, FiMail, FiPhone, FiMapPin, FiPlus, FiTrash2, FiEdit } from "react-icons/fi";
import type { Address } from "@/types";

export default function AccountPage() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const { showToast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    full_name: "", phone: "", address_line1: "", address_line2: "",
    city: "", state: "", pincode: "", landmark: "", address_type: "home", is_default: false,
  });

  useEffect(() => {
    async function load() {
      const token = await getToken();
      const res = await api.get<{ success: boolean; data: Address[] }>("/addresses", token);
      if (res.success) setAddresses(res.data);
      setLoading(false);
    }
    load();
  }, [getToken]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = await getToken();
    const res = await api.post<{ success: boolean; data: Address }>("/addresses", form, token);
    if (res.success) {
      setAddresses((prev) => [res.data, ...prev]);
      setShowForm(false);
      setForm({ full_name: "", phone: "", address_line1: "", address_line2: "", city: "", state: "", pincode: "", landmark: "", address_type: "home", is_default: false });
      showToast("Address added!", "success");
    }
  };

  const handleDelete = async (id: number) => {
    const token = await getToken();
    await api.delete(`/addresses/${id}`, token);
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    showToast("Address deleted", "info");
  };

  return (
    <div className="container-fk py-4 space-y-4">
      {/* Profile */}
      <div className="card p-6">
        <h1 className="text-xl font-bold mb-4">My Account</h1>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-flipkart-primary flex items-center justify-center text-white text-2xl font-bold">
            {user?.firstName?.charAt(0) || "U"}
          </div>
          <div>
            <h2 className="text-lg font-semibold">{user?.firstName} {user?.lastName}</h2>
            <p className="text-sm text-flipkart-text-secondary flex items-center gap-1"><FiMail size={14} /> {user?.emailAddresses?.[0]?.emailAddress}</p>
            {user?.phoneNumbers?.[0] && (
              <p className="text-sm text-flipkart-text-secondary flex items-center gap-1"><FiPhone size={14} /> {user.phoneNumbers[0].phoneNumber}</p>
            )}
          </div>
        </div>
      </div>

      {/* Addresses */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2"><FiMapPin /> Manage Addresses</h2>
          <button onClick={() => setShowForm(!showForm)} className="btn btn-outline btn-sm flex items-center gap-1">
            <FiPlus size={14} /> Add New
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleAdd} className="border rounded p-4 space-y-3 mb-4">
            <div className="grid grid-cols-2 gap-3">
              <input className="input" placeholder="Full Name *" required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
              <input className="input" placeholder="Phone *" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <input className="input" placeholder="Address Line 1 *" required value={form.address_line1} onChange={(e) => setForm({ ...form, address_line1: e.target.value })} />
            <input className="input" placeholder="Address Line 2" value={form.address_line2} onChange={(e) => setForm({ ...form, address_line2: e.target.value })} />
            <div className="grid grid-cols-3 gap-3">
              <input className="input" placeholder="City *" required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              <select className="input" required value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })}>
                <option value="">State *</option>
                {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <input className="input" placeholder="Pincode *" required value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary">Save</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-ghost">Cancel</button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="skeleton w-full h-32" />
        ) : addresses.length === 0 ? (
          <p className="text-sm text-flipkart-text-secondary py-4">No addresses saved yet.</p>
        ) : (
          <div className="space-y-3">
            {addresses.map((addr) => (
              <div key={addr.id} className="flex items-start justify-between p-3 border rounded">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{addr.full_name}</span>
                    <span className="badge badge-blue">{addr.address_type}</span>
                    {addr.is_default && <span className="badge badge-green">Default</span>}
                  </div>
                  <p className="text-sm text-flipkart-text-secondary">
                    {addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ""}<br />
                    {addr.city}, {addr.state} - {addr.pincode}
                  </p>
                  <p className="text-sm text-flipkart-text-secondary mt-1">Phone: {addr.phone}</p>
                </div>
                <button onClick={() => handleDelete(addr.id)} className="btn btn-ghost btn-sm text-flipkart-red">
                  <FiTrash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
