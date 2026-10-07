"use client";

import { useEffect, useState } from "react";
import { ArrowUpCircle, Check, AlertTriangle, Search } from "lucide-react";

type Product = { id: string; name: string; sku: string; unit: string; currentStock: number; sellingPrice: number; };
type Transaction = {
  id: string; type: string; quantity: number; previousStock: number; newStock: number;
  unitPrice: number; totalPrice: number; reference: string | null;
  productName: string; productSku: string; userName: string; createdAt: string;
};

const EMPTY_FORM = { productId: "", quantity: "1", unitPrice: "", reference: "", notes: "" };

export default function StockOutPage() {
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
      fetch("/api/transactions?type=out").then((r) => r.json()),
    ]).then(([p, t]) => { setProducts(p); setTransactions(t); });
  }, []);

  const selectedProduct = products.find((p) => p.id === form.productId);
  const insufficient = selectedProduct && Number(form.quantity) > selectedProduct.currentStock;

  const handleSubmit = async () => {
    if (!form.productId || !form.quantity) { setError("Product and quantity required!"); return; }
    if (insufficient) { setError("Insufficient stock!"); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, type: "out" }),
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
    !search || t.productName.toLowerCase().includes(search.toLowerCase())
  );

  const timeAgo = (date: string) => {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff / 60)}h ago`;
  };

  const inputClass = "w-full px-4 py-2.5 border-2 border-gray-200 dark:border-white/10 rounded-xl text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-red-400 transition-all";

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-2">
        <ArrowUpCircle size={28} className="text-red-500" /> Stock Out
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/5 p-6 space-y-4">
          <h2 className="font-bold text-gray-900 dark:text-white">Dispatch Stock</h2>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Product *</label>
            <select value={form.productId} onChange={(e) => {
              const p = products.find((p) => p.id === e.target.value);
              setForm({ ...form, productId: e.target.value, unitPrice: p ? String(p.sellingPrice) : "" });
            }} className={inputClass}>
              <option value="">Select product...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id} disabled={p.currentStock === 0}>
                  {p.name} ({p.sku}) — {p.currentStock} {p.unit} {p.currentStock === 0 ? "❌" : p.currentStock <= 5 ? "⚠️" : ""}
                </option>
              ))}
            </select>
          </div>

          {selectedProduct && (
            <div className={`p-3 rounded-xl border text-sm ${
              selectedProduct.currentStock === 0
                ? "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20"
                : selectedProduct.currentStock <= 5
                ? "bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20"
                : "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20"
            }`}>
              <p className="font-semibold text-gray-900 dark:text-white">{selectedProduct.name}</p>
              <p className="text-xs mt-0.5 text-gray-500 dark:text-gray-400">Available: <strong>{selectedProduct.currentStock}</strong> {selectedProduct.unit}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Quantity *</label>
              <input type="number" min="1" value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className={`${inputClass} ${insufficient ? "border-red-400" : ""}`} />
              {insufficient && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertTriangle size={11} /> Insufficient stock</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Unit Price</label>
              <input type="number" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: e.target.value })} className={inputClass} />
            </div>
          </div>

          <input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="Reference / Order number" className={inputClass} />
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notes..." rows={2} className={`${inputClass} resize-none`} />

          {error && <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-600 dark:text-red-400">{error}</div>}
          {success && <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2"><Check size={14} /> Dispatched successfully!</div>}

          <button onClick={handleSubmit} disabled={saving || !form.productId || !form.quantity || !!insufficient}
            className="w-full py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold rounded-xl disabled:opacity-50 hover:opacity-90 transition-all flex items-center justify-center gap-2">
            <ArrowUpCircle size={16} /> {saving ? "Processing..." : "Dispatch Stock"}
          </button>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 dark:border-white/5 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 dark:text-white">Stock Out History</h2>
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
                <div className="w-10 h-10 bg-red-50 dark:bg-red-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <ArrowUpCircle size={18} className="text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{tx.productName}</p>
                  <p className="text-xs text-gray-400">{tx.productSku} · {tx.userName} · {tx.reference || "No ref"}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-red-500">-{tx.quantity}</p>
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