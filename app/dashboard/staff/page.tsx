"use client";

import { useEffect, useState, useCallback } from "react";
import { Users, Plus, X, Check, Trash2, Mail, Shield } from "lucide-react";

type Staff = { id: string; name: string; email: string; role: string; isActive: boolean | null; createdAt: string; };

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400",
  manager: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
  staff: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
};

const EMPTY_FORM = { name: "", email: "", password: "", role: "staff" };

export default function StaffPage() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchStaff = useCallback(async () => {
    const res = await fetch("/api/staff");
    setStaffList(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  const handleSave = async () => {
    if (!form.name || !form.email) return;
    setSaving(true);
    try {
      await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      await fetchStaff();
      setShowModal(false);
      setForm(EMPTY_FORM);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this staff member?")) return;
    await fetch(`/api/staff/${id}`, { method: "DELETE" });
    setStaffList(staffList.filter((s) => s.id !== id));
  };

  const inputClass = "w-full px-4 py-2.5 border-2 border-gray-200 dark:border-white/10 rounded-xl text-sm bg-transparent text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-emerald-400 transition-all";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-2">
          <Users size={28} className="text-emerald-600" /> Staff
        </h1>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl hover:opacity-90 shadow-lg shadow-emerald-500/20">
          <Plus size={16} /> Add Staff
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {["admin", "manager", "staff"].map((role) => (
          <div key={role} className={`rounded-2xl border p-4 ${ROLE_COLORS[role].replace("text-", "border-").split(" ")[0]}/20`}>
            <p className={`text-2xl font-black ${ROLE_COLORS[role].split(" ")[1]}`}>{staffList.filter((s) => s.role === role).length}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize mt-0.5">{role}s</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-40 bg-white dark:bg-gray-900 rounded-2xl animate-pulse border border-gray-100 dark:border-white/5" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {staffList.map((s) => (
            <div key={s.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/5 p-5 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-white font-black text-xl">
                  {s.name.charAt(0)}
                </div>
                <button onClick={() => handleDelete(s.id)} className="p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
              <p className="font-bold text-gray-900 dark:text-white mb-1">{s.name}</p>
              <span className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full capitalize mb-3 ${ROLE_COLORS[s.role]}`}>{s.role}</span>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Mail size={12} /> {s.email}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-md border border-gray-100 dark:border-white/10 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black text-gray-900 dark:text-white text-xl">Add Staff Member</h2>
              <button onClick={() => setShowModal(false)} className="p-2 bg-gray-100 dark:bg-white/10 rounded-xl text-gray-500"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name *" className={inputClass} />
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email *" className={inputClass} />
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password (default: staff123)" className={inputClass} />
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Role</label>
                <div className="grid grid-cols-3 gap-2">
                  {["admin", "manager", "staff"].map((r) => (
                    <button key={r} onClick={() => setForm({ ...form, role: r })}
                      className={`py-2 rounded-xl text-sm font-bold capitalize transition-all border ${form.role === r ? ROLE_COLORS[r] : "border-gray-200 dark:border-white/10 text-gray-400"}`}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 bg-gray-100 dark:bg-white/10 rounded-2xl text-sm font-semibold text-gray-600 dark:text-gray-400">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.name || !form.email}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-2xl disabled:opacity-50 flex items-center justify-center gap-2">
                <Check size={16} /> {saving ? "Adding..." : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}