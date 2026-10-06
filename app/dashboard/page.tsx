"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Package, TrendingUp, TrendingDown, AlertTriangle,
  ArrowDownCircle, ArrowUpCircle, DollarSign,
  ShoppingBag, Clock,
} from "lucide-react";

type Stats = {
  totalProducts: number;
  totalStockValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  todayIn: number;
  todayOut: number;
  recentTransactions: Array<{
    id: string;
    type: string;
    quantity: number;
    productName: string;
    productSku: string;
    userName: string;
    createdAt: string;
  }>;
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats").then((r) => r.json()).then((data) => {
      setStats(data);
      setLoading(false);
    });
  }, []);

  const formatPrice = (p: number) => `$${(p / 1000000).toFixed(1)}M`;
  const timeAgo = (date: string) => {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff / 60)}h ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white">
          Dashboard 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-white dark:bg-gray-900 rounded-2xl animate-pulse border border-gray-100 dark:border-white/5" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Products", value: stats?.totalProducts, icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-500/10", border: "border-blue-100 dark:border-blue-500/20" },
            { label: "Stock Value", value: formatPrice(stats?.totalStockValue || 0), icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-100 dark:border-emerald-500/20" },
            { label: "Low Stock", value: stats?.lowStockCount, icon: AlertTriangle, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-500/10", border: "border-orange-100 dark:border-orange-500/20", link: "/dashboard/products?filter=low" },
            { label: "Out of Stock", value: stats?.outOfStockCount, icon: Package, color: "text-red-600", bg: "bg-red-50 dark:bg-red-500/10", border: "border-red-100 dark:border-red-500/20", link: "/dashboard/products?filter=out" },
          ].map((s) => (
            <div key={s.label} className={`bg-white dark:bg-gray-900 rounded-2xl border ${s.border} p-5 ${s.link ? "cursor-pointer hover:shadow-md transition-all" : ""}`}
              onClick={() => s.link && (window.location.href = s.link)}>
              <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
                <s.icon size={20} className={s.color} />
              </div>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{s.value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Today's Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-emerald-100 dark:border-emerald-500/20 p-5">
            <div className="flex items-center gap-2 mb-2">
              <ArrowDownCircle size={18} className="text-emerald-600" />
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Today In</span>
            </div>
            <p className="text-3xl font-black text-emerald-600">+{stats?.todayIn || 0}</p>
            <p className="text-xs text-gray-400 mt-1">units received</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-red-100 dark:border-red-500/20 p-5">
            <div className="flex items-center gap-2 mb-2">
              <ArrowUpCircle size={18} className="text-red-500" />
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Today Out</span>
            </div>
            <p className="text-3xl font-black text-red-500">-{stats?.todayOut || 0}</p>
            <p className="text-xs text-gray-400 mt-1">units dispatched</p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/5 p-5">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: "/dashboard/stock-in", label: "Add Stock In", icon: ArrowDownCircle, color: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30" },
              { href: "/dashboard/stock-out", label: "Add Stock Out", icon: ArrowUpCircle, color: "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30" },
              { href: "/dashboard/products", label: "View Products", icon: ShoppingBag, color: "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30" },
              { href: "/dashboard/reports", label: "View Reports", icon: TrendingUp, color: "bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/30" },
            ].map((a) => (
              <Link key={a.href} href={a.href}
                className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-semibold no-underline transition-all hover:opacity-80 ${a.color}`}>
                <a.icon size={16} />
                {a.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 dark:border-white/5 flex items-center justify-between">
          <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Clock size={18} className="text-emerald-600" /> Recent Transactions
          </h2>
          <Link href="/dashboard/reports" className="text-xs text-emerald-600 font-semibold no-underline hover:underline">
            View all →
          </Link>
        </div>
        <div className="divide-y divide-gray-50 dark:divide-white/5">
          {stats?.recentTransactions.slice(0, 8).map((tx) => (
            <div key={tx.id} className="flex items-center gap-4 px-6 py-3.5">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                tx.type === "in" ? "bg-emerald-50 dark:bg-emerald-500/10" : "bg-red-50 dark:bg-red-500/10"
              }`}>
                {tx.type === "in"
                  ? <ArrowDownCircle size={16} className="text-emerald-600" />
                  : <ArrowUpCircle size={16} className="text-red-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{tx.productName}</p>
                <p className="text-xs text-gray-400">{tx.productSku} · {tx.userName}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className={`font-bold text-sm ${tx.type === "in" ? "text-emerald-600" : "text-red-500"}`}>
                  {tx.type === "in" ? "+" : "-"}{tx.quantity}
                </p>
                <p className="text-xs text-gray-400">{timeAgo(tx.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}