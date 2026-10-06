"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Package, Sun, Moon, LayoutDashboard, ShoppingBag,
  Truck, ArrowDownCircle, ArrowUpCircle, BarChart3,
  Users, LogOut, ChevronDown, AlertTriangle,
} from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [theme, setTheme] = useState("light");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [lowStockCount, setLowStockCount] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("theme") || "light";
    setTheme(saved);
    document.documentElement.classList.toggle("dark", saved === "dark");
  }, []);

  useEffect(() => {
    fetch("/api/stats").then((r) => r.json()).then((data) => {
      setLowStockCount(data.lowStockCount || 0);
    });
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  const ROLE_COLORS: Record<string, string> = {
    admin: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400",
    manager: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
    staff: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
  };

  const NAV_LINKS = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "manager", "staff"] },
    { href: "/dashboard/products", label: "Products", icon: ShoppingBag, roles: ["admin", "manager", "staff"] },
    { href: "/dashboard/suppliers", label: "Suppliers", icon: Truck, roles: ["admin", "manager"] },
    { href: "/dashboard/stock-in", label: "Stock In", icon: ArrowDownCircle, roles: ["admin", "manager", "staff"] },
    { href: "/dashboard/stock-out", label: "Stock Out", icon: ArrowUpCircle, roles: ["admin", "manager", "staff"] },
    { href: "/dashboard/reports", label: "Reports", icon: BarChart3, roles: ["admin", "manager"] },
    { href: "/dashboard/staff", label: "Staff", icon: Users, roles: ["admin"] },
  ].filter((l) => l.roles.includes(session?.user?.role || "staff"));

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-100 dark:border-white/5 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 no-underline flex-shrink-0">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Package size={16} className="text-white" />
          </div>
          <span className="font-black text-gray-900 dark:text-white hidden sm:block">StockPro</span>
        </Link>

        {/* Nav */}
        <div className="hidden lg:flex items-center gap-1 flex-1">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold no-underline transition-all ${
                pathname === link.href
                  ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
              }`}>
              <link.icon size={15} />
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 ml-auto lg:ml-0">
          {lowStockCount > 0 && (
            <Link href="/dashboard/products?filter=low" className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold border border-red-200 dark:border-red-500/20 no-underline hover:bg-red-100 transition-all">
              <AlertTriangle size={13} />
              {lowStockCount} Low Stock
            </Link>
          )}

          <button onClick={toggleTheme}
            className="p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-all">
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {session && (
            <div className="relative">
              <button onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-2.5 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all">
                {session.user.image ? (
                  <img src={session.user.image} alt="" className="w-7 h-7 rounded-full" />
                ) : (
                  <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{session.user.name?.charAt(0)}</span>
                  </div>
                )}
                <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[80px] truncate">
                  {session.user.name?.split(" ")[0]}
                </span>
                <ChevronDown size={14} className="text-gray-400" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-52 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-white/10 py-2 z-50">
                  <div className="px-4 py-2.5 border-b border-gray-100 dark:border-white/10">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{session.user.name}</p>
                    <p className="text-xs text-gray-400 truncate">{session.user.email}</p>
                    <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full mt-1 capitalize ${ROLE_COLORS[session.user.role || "staff"]}`}>
                      {session.user.role}
                    </span>
                  </div>
                  <button onClick={() => signOut({ callbackUrl: "/login" })}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}