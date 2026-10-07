"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  ShoppingBag, Plus, Search, Filter, X, Check,
  AlertTriangle, Package, Pencil, Trash2,
} from "lucide-react";

type Product = {
  id: string;
  name: string;
  sku: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  currentStock: number;
  minStock: number;
  maxStock: number | null;
  categoryName: string | null;
  categoryColor: string | null;
  categoryIcon: string | null;
  supplierName: string | null;
  warehouseName: string | null;
};

type Category = { id: string; name: string; icon: string | null; color: string | null; };
type Supplier = { id: string; name: string; };
type Warehouse = { id: string; name: string; };

const EMPTY_FORM = {
  name: "", sku: "", description: "", categoryId: "",
  supplierId: "", warehouseId: "", unit: "pcs",
  costPrice: "", sellingPrice: "", currentStock: "0",
  minStock: "10", maxStock: "1000",
};

function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStock, setFilterStock] = useState(searchParams.get("filter") || "");
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filterCategory) params.set("category", filterCategory);
    if (filterStock) params.set("filter", filterStock);

    const [pRes, cRes, sRes, wRes] = await Promise.all([
      fetch(`/api/products?${params}`),
      fetch("/api/categories"),
      fetch("/api/suppliers"),
      fetch("/api/warehouses"),
    ]);
    setProducts(await pRes.json());
    setCategories(await cRes.json());
    setSuppliers(await sRes.json());
    setWarehouses(await wRes.json());
    setLoading(false);
  }, [search, filterCategory, filterStock]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openAdd = () => { setEditProduct(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (p: Product) => {
    setEditProduct(p);
    setForm({
      name: p.name, sku: p.sku, description: "",
      categoryId: "", supplierId: "", warehouseId: "",
      unit: p.unit, costPrice: String(p.costPrice),
      sellingPrice: String(p.sellingPrice),
      currentStock: String(p.currentStock),
      minStock: String(p.minStock),
      maxStock: String(p.maxStock || 1000),
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.sku) return;
    setSaving(true);
    try {
      if (editProduct) {
        const res = await fetch(`/api/products/${editProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const updated = await res.json();
        setProducts(products.map((p) => p.id === updated.id ? { ...p, ...updated } : p));
      } else {
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        await fetchData();
      }
      setShowModal(false);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    setProducts(products.filter((p) => p.id !== id));
  };

  const getStockStatus = (p: Product) => {
    if (p.currentStock === 0) return { label: "Out of Stock", color: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400" };
    if (p.currentStock <= p.minStock) return { label: "Low Stock", color: "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400" };
    return { label: "In Stock", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" };
  };

  const inputClass = "w-full px-4 py-2.5 border-2 border-gray-200 dark:border-white/10 rounded-xl text-sm bg-transparent text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-emerald-400 transition-all";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <ShoppingBag size={28} className="text-emerald-600" /> Products
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{products.length} products</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl hover:opacity-90 shadow-lg shadow-emerald-500/20">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or SKU..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl text-sm outline-none focus:border-emerald-400 text-gray-900 dark:text-white" />
        </div>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-700 dark:text-gray-300 outline-none">
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
        <div className="flex gap-2">
          {[
            { value: "", label: "All" },
            { value: "low", label: "⚠️ Low Stock" },
            { value: "out", label: "❌ Out of Stock" },
          ].map((f) => (
            <button key={f.value} onClick={() => setFilterStock(f.value)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${filterStock === f.value ? "bg-emerald-600 text-white" : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/10"}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50 dark:border-white/5 bg-gray-50 dark:bg-white/3">
                {["Product", "SKU", "Category", "Stock", "Status", "Cost Price", "Selling Price", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(8)].map((_, j) => (
                      <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-100 dark:bg-white/5 rounded-full animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400">
                  <Package size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No products found</p>
                </td></tr>
              ) : products.map((product, i) => {
                const status = getStockStatus(product);
                return (
                  <tr key={product.id} className={`hover:bg-gray-50 dark:hover:bg-white/3 transition-all ${i < products.length - 1 ? "border-b border-gray-50 dark:border-white/5" : ""}`}>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{product.name}</p>
                      <p className="text-xs text-gray-400">{product.warehouseName || "—"}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-lg">{product.sku}</span>
                    </td>
                    <td className="px-5 py-4">
                      {product.categoryName ? (
                        <span className="text-sm" style={{ color: product.categoryColor || undefined }}>
                          {product.categoryIcon} {product.categoryName}
                        </span>
                      ) : <span className="text-gray-400 text-sm">—</span>}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 dark:text-white">{product.currentStock}</span>
                        <span className="text-xs text-gray-400">{product.unit}</span>
                        {product.currentStock <= product.minStock && product.currentStock > 0 && (
                          <AlertTriangle size={13} className="text-orange-400" />
                        )}
                      </div>
                      <p className="text-xs text-gray-400">min: {product.minStock}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${status.color}`}>{status.label}</span>
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                      {(product.costPrice / 1000).toLocaleString()}K
                    </td>
                    <td className="px-5 py-4 text-sm font-bold text-emerald-600">
                      {(product.sellingPrice / 1000).toLocaleString()}K
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(product)}
                          className="p-1.5 text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-all">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDelete(product.id)}
                          className="p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-lg border border-gray-100 dark:border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black text-gray-900 dark:text-white text-xl">{editProduct ? "Edit Product" : "Add Product"}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 bg-gray-100 dark:bg-white/10 rounded-xl text-gray-500"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product name *" className={inputClass} />
                <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="SKU *" className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className={inputClass}>
                  <option value="">Category</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
                <select value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })} className={inputClass}>
                  <option value="">Supplier</option>
                  {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select value={form.warehouseId} onChange={(e) => setForm({ ...form, warehouseId: e.target.value })} className={inputClass}>
                  <option value="">Warehouse</option>
                  {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
                <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className={inputClass}>
                  {["pcs", "kg", "g", "l", "ml", "m", "box", "pack"].map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Cost Price</label>
                  <input type="number" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Selling Price</label>
                  <input type="number" value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Current Stock</label>
                  <input type="number" value={form.currentStock} onChange={(e) => setForm({ ...form, currentStock: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Min Stock</label>
                  <input type="number" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Max Stock</label>
                  <input type="number" value={form.maxStock} onChange={(e) => setForm({ ...form, maxStock: e.target.value })} className={inputClass} />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 bg-gray-100 dark:bg-white/10 rounded-2xl text-sm font-semibold text-gray-600 dark:text-gray-400">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.name || !form.sku}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-2xl disabled:opacity-50 flex items-center justify-center gap-2">
                <Check size={16} /> {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-400">Loading...</div>}>
      <ProductsContent />
    </Suspense>
  );
}