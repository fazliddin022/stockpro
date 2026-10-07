"use client";

import { useEffect, useState, useCallback } from "react";
import { ArrowDownCircle, Check, Search } from "lucide-react";

type Product = { id: string; name: string; sku: string; unit: string; currentStock: number; costPrice: number; };
type Transaction = {
  id: string; type: string; quantity: number; previousStock: number; newStock: number;
  unitPrice: number; totalPrice: number; reference: string | null; notes: string | null;
  productName: string; productSku: string; userName: string; createdAt: string;
};

const EMPTY_FORM = { productId: "", quantity: "1", unitPrice: "", reference: "", notes: "" };

export default function StockInPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/transactions?type=in").then((r) => r.json()),
    ]).then(([p, t]) => { setProducts(p); setTransactions(t); });
  }, []);

  const selectedProduct = products.find((p) => p.id === form.productId);

  const handleSubmit = async () => {
    if (!form.productId || !form.quantity) { setError("Product and quantity required!"); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, type: "in" }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error); return; }
      const newTx = await res.json();
      setTransactions([newTx, ...transactions]);
      setProducts(products.map((p) => p.id === form.productId ? { ...p, currentStock: newTx.newStock } : p));
      setForm(EMPTY_FORM);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } finally { setSaving(false); }
  };

  const filtered = transactions.filter((t) =>
    !search || t.productName.toLowerCase().includes(search.toLowerCase()) || t.productSku.toLowerCase().includes(search.toLowerCase())
  );

  const timeAgo = (date: string) => {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff / 60)}h ago`;
  };

  const inputClass = "w-full px-4 py-2.5 border-2 border-gray-200 dark:border-white/10 rounded-xl text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-emerald-400 transition-all";

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-2">
        <ArrowDownCircle size={28} className="text-emerald-600" /> Stock In
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/5 p-6 space-y-4">
          <h2 className="font-bold text-gray-900 dark:text-white">Receive Stock</h2>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Product *</label>
            <select value={form.productId} onChange={(e) => {
              const p = products.find((p) => p.id === e.target.value);
              setForm({ ...form, productId: e.target.value, unitPrice: p ? String(p.costPrice) : "" });
            }} className={inputClass}>
              <option value="">Select product...</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.sku}) — {p.currentStock} {p.unit}</option>)}
            </select>
          </div>

          {selectedProduct && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-200 dark:border-emerald-500/20 text-sm">
              <p className="font-semibold text-emerald-700 dark:text-emerald-400">{selectedProduct.name}</p>
              <p className="text-emerald-600 dark:text-emerald-300 text-xs mt-0.5">Current: {selectedProduct.currentStock} {selectedProduct.unit}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Quantity *</label>
              <input type="number" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Unit Price</label>
              <input type="number" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: e.target.value })} className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Reference / PO Number</label>
            <input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="PO-2026-001" className={inputClass} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className={`${inputClass} resize-none`} />
          </div>

          {error && <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-600 dark:text-red-400">{error}</div>}
          {success && <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2"><Check size={14} /> Stock received successfully!</div>}

          <button onClick={handleSubmit} disabled={saving || !form.productId || !form.quantity}
            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl disabled:opacity-50 hover:opacity-90 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2">
            <ArrowDownCircle size={16} /> {saving ? "Processing..." : "Receive Stock"}
          </button>
        </div>

        {/* History */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 dark:border-white/5 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 dark:text-white">Stock In History</h2>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..."
                className="pl-9 pr-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-xs outline-none text-gray-900 dark:text-white" />
            </div>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-white/5 max-h-[500px] overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">No records found</div>
            ) : filtered.map((tx) => (
              <div key={tx.id} className="flex items-center gap-4 px-6 py-4">
                <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <ArrowDownCircle size={18} className="text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{tx.productName}</p>
                  <p className="text-xs text-gray-400">{tx.productSku} · {tx.userName} · {tx.reference || "No ref"}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-emerald-600">+{tx.quantity}</p>
                  <p className="text-xs text-gray-400">{tx.previousStock} → {tx.newStock}</p>
                  <p className="text-xs text-gray-300 dark:text-gray-600">{timeAgo(tx.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}