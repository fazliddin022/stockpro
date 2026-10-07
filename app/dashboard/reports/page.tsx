"use client";

import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Package, ArrowDownCircle, ArrowUpCircle } from "lucide-react";

type Transaction = {
  id: string; type: string; quantity: number; totalPrice: number;
  productName: string; productSku: string; productUnit: string;
  userName: string; createdAt: string;
};

type Product = {
  id: string; name: string; sku: string; unit: string;
  currentStock: number; minStock: number; costPrice: number;
  sellingPrice: number; categoryName: string | null;
};

export default function ReportsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/transactions").then((r) => r.json()),
      fetch("/api/products").then((r) => r.json()),
    ]).then(([t, p]) => { setTransactions(t); setProducts(p); setLoading(false); });
  }, []);

  const totalIn = transactions.filter((t) => t.type === "in").reduce((s, t) => s + t.quantity, 0);
  const totalOut = transactions.filter((t) => t.type === "out").reduce((s, t) => s + t.quantity, 0);
  const totalRevenue = transactions.filter((t) => t.type === "out").reduce((s, t) => s + t.totalPrice, 0);
  const totalCost = transactions.filter((t) => t.type === "in").reduce((s, t) => s + t.totalPrice, 0);
  const totalStockValue = products.reduce((s, p) => s + p.currentStock * p.costPrice, 0);
  const lowStock = products.filter((p) => p.currentStock <= p.minStock);

  const formatPrice = (p: number) => `$${(p / 1000000).toFixed(2)}M`;

  // Top moved products
  const productMovement: Record<string, { name: string; in: number; out: number }> = {};
  transactions.forEach((t) => {
    if (!productMovement[t.productSku]) productMovement[t.productSku] = { name: t.productName, in: 0, out: 0 };
    if (t.type === "in") productMovement[t.productSku].in += t.quantity;
    if (t.type === "out") productMovement[t.productSku].out += t.quantity;
  });
  const topProducts = Object.entries(productMovement)
    .sort((a, b) => (b[1].in + b[1].out) - (a[1].in + a[1].out))
    .slice(0, 8);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-2">
        <BarChart3 size={28} className="text-emerald-600" /> Reports
      </h1>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Stock In", value: `+${totalIn}`, icon: ArrowDownCircle, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-100 dark:border-emerald-500/20" },
          { label: "Total Stock Out", value: `-${totalOut}`, icon: ArrowUpCircle, color: "text-red-500", bg: "bg-red-50 dark:bg-red-500/10", border: "border-red-100 dark:border-red-500/20" },
          { label: "Total Revenue", value: formatPrice(totalRevenue), icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-500/10", border: "border-blue-100 dark:border-blue-500/20" },
          { label: "Stock Value", value: formatPrice(totalStockValue), icon: DollarSign, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-500/10", border: "border-purple-100 dark:border-purple-500/20" },
        ].map((s) => (
          <div key={s.label} className={`bg-white dark:bg-gray-900 rounded-2xl border ${s.border} p-5`}>
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
              <s.icon size={20} className={s.color} />
            </div>
            <p className="text-2xl font-black text-gray-900 dark:text-white">{s.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 dark:border-white/5">
            <h2 className="font-bold text-gray-900 dark:text-white">Most Active Products</h2>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-white/5">
            {topProducts.map(([sku, data]) => (
              <div key={sku} className="flex items-center gap-4 px-6 py-4">
                <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center text-sm font-black text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                  📦
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{data.name}</p>
                  <p className="text-xs text-gray-400">{sku}</p>
                </div>
                <div className="flex items-center gap-3 text-xs flex-shrink-0">
                  <span className="text-emerald-600 font-bold">+{data.in}</span>
                  <span className="text-red-500 font-bold">-{data.out}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-orange-100 dark:border-orange-500/20 overflow-hidden">
          <div className="px-6 py-4 border-b border-orange-50 dark:border-orange-500/10 flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
            <h2 className="font-bold text-gray-900 dark:text-white">Low Stock Alerts ({lowStock.length})</h2>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-white/5 max-h-72 overflow-y-auto">
            {lowStock.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">All products have sufficient stock ✓</div>
            ) : lowStock.map((p) => (
              <div key={p.id} className="flex items-center gap-4 px-6 py-4">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${p.currentStock === 0 ? "bg-red-50 dark:bg-red-500/10" : "bg-orange-50 dark:bg-orange-500/10"}`}>
                  {p.currentStock === 0 ? "❌" : "⚠️"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.sku}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`font-bold text-sm ${p.currentStock === 0 ? "text-red-500" : "text-orange-500"}`}>
                    {p.currentStock} {p.unit}
                  </p>
                  <p className="text-xs text-gray-400">min: {p.minStock}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* All Transactions */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 dark:border-white/5">
          <h2 className="font-bold text-gray-900 dark:text-white">All Transactions ({transactions.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50 dark:border-white/5 bg-gray-50 dark:bg-white/3">
                {["Type", "Product", "Qty", "Unit Price", "Total", "Reference", "By", "Date"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 20).map((tx, i) => (
                <tr key={tx.id} className={`hover:bg-gray-50 dark:hover:bg-white/3 transition-all ${i < Math.min(transactions.length, 20) - 1 ? "border-b border-gray-50 dark:border-white/5" : ""}`}>
                  <td className="px-5 py-3.5">
                    <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full w-fit ${tx.type === "in" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"}`}>
                      {tx.type === "in" ? <ArrowDownCircle size={11} /> : <ArrowUpCircle size={11} />}
                      {tx.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{tx.productName}</p>
                    <p className="text-xs text-gray-400">{tx.productSku}</p>
                  </td>
                  <td className="px-5 py-3.5 font-bold text-gray-900 dark:text-white">{tx.type === "in" ? "+" : "-"}{tx.quantity} {tx.productUnit}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600 dark:text-gray-300">{tx.unitPrice ? `${(tx.unitPrice / 1000).toLocaleString()}K` : "—"}</td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-gray-900 dark:text-white">{tx.totalPrice ? `${(tx.totalPrice / 1000000).toFixed(2)}M` : "—"}</td>
                  <td className="px-5 py-3.5 text-xs text-gray-400">{tx.reference || "—"}</td>
                  <td className="px-5 py-3.5 text-xs text-gray-500 dark:text-gray-400">{tx.userName}</td>
                  <td className="px-5 py-3.5 text-xs text-gray-400">
                    {new Date(tx.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}