"use client";

import { useEffect, useState, useCallback } from "react";
import { Truck, Plus, X, Check, Trash2, Mail, Phone, MapPin, User } from "lucide-react";

type Supplier = {
  id: string; name: string; email: string | null; phone: string | null;
  address: string | null; contactPerson: string | null; isActive: boolean | null;
};

const EMPTY_FORM = { name: "", email: "", phone: "", address: "", contactPerson: "" };

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchSuppliers = useCallback(async () => {
    const res = await fetch("/api/suppliers");
    setSuppliers(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchSuppliers(); }, [fetchSuppliers]);

  const handleSave = async () => {
    if (!form.name) return;
    setSaving(true);
    try {
      await fetch("/api/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      await fetchSuppliers();
      setShowModal(false);
      setForm(EMPTY_FORM);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this supplier?")) return;
    await fetch(`/api/suppliers/${id}`, { method: "DELETE" });
    setSuppliers(suppliers.filter((s) => s.id !== id));
  };

  const inputClass = "w-full px-4 py-2.5 border-2 border-gray-200 dark:border-white/10 rounded-xl text-sm bg-transparent text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-emerald-400 transition-all";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-2">
          <Truck size={28} className="text-emerald-600" /> Suppliers
        </h1>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl hover:opacity-90 shadow-lg shadow-emerald-500/20">
          <Plus size={16} /> Add Supplier
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-48 bg-white dark:bg-gray-900 rounded-2xl animate-pulse border border-gray-100 dark:border-white/5" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map((s) => (
            <div key={s.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/5 p-5 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl flex items-center justify-center text-2xl">🏪</div>
                <button onClick={() => handleDelete(s.id)} className="p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-3">{s.name}</h3>
              <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400">
                {s.contactPerson && <div className="flex items-center gap-2"><User size={12} />{s.contactPerson}</div>}
                {s.email && <div className="flex items-center gap-2"><Mail size={12} />{s.email}</div>}
                {s.phone && <div className="flex items-center gap-2"><Phone size={12} />{s.phone}</div>}
                {s.address && <div className="flex items-center gap-2"><MapPin size={12} />{s.address}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-md border border-gray-100 dark:border-white/10 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black text-gray-900 dark:text-white text-xl">Add Supplier</h2>
              <button onClick={() => setShowModal(false)} className="p-2 bg-gray-100 dark:bg-white/10 rounded-xl text-gray-500"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Supplier name *" className={inputClass} />
              <input value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} placeholder="Contact person" className={inputClass} />
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className={inputClass} />
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className={inputClass} />
              <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Address" className={inputClass} />
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 bg-gray-100 dark:bg-white/10 rounded-2xl text-sm font-semibold text-gray-600 dark:text-gray-400">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.name}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-2xl disabled:opacity-50 flex items-center justify-center gap-2">
                <Check size={16} /> {saving ? "Saving..." : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}