import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products, transactions } from "@/lib/schema";
import { eq, desc, lt, sql } from "drizzle-orm";
import { auth } from "@/lib/auth-config";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const allProducts = await db.select().from(products).where(eq(products.isActive, true));
  const recentTx = await db.select().from(transactions).orderBy(desc(transactions.createdAt)).limit(10);

  const totalProducts = allProducts.length;
  const totalStockValue = allProducts.reduce((s, p) => s + (p.currentStock * p.costPrice), 0);
  const lowStockProducts = allProducts.filter((p) => p.currentStock <= p.minStock);
  const outOfStock = allProducts.filter((p) => p.currentStock === 0);

  const todayTx = recentTx.filter((t) => new Date(t.createdAt!).toDateString() === new Date().toDateString());
  const todayIn = todayTx.filter((t) => t.type === "in").reduce((s, t) => s + t.quantity, 0);
  const todayOut = todayTx.filter((t) => t.type === "out").reduce((s, t) => s + t.quantity, 0);

  return NextResponse.json({
    totalProducts,
    totalStockValue,
    lowStockCount: lowStockProducts.length,
    outOfStockCount: outOfStock.length,
    todayIn,
    todayOut,
    recentTransactions: recentTx,
  });
}