import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products, categories, suppliers, warehouses } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth-config";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const categoryId = searchParams.get("category") || "";
  const filter = searchParams.get("filter") || "";

  let data = await db
    .select({
      id: products.id,
      name: products.name,
      sku: products.sku,
      description: products.description,
      unit: products.unit,
      costPrice: products.costPrice,
      sellingPrice: products.sellingPrice,
      currentStock: products.currentStock,
      minStock: products.minStock,
      maxStock: products.maxStock,
      isActive: products.isActive,
      categoryId: products.categoryId,
      categoryName: categories.name,
      categoryColor: categories.color,
      categoryIcon: categories.icon,
      supplierId: products.supplierId,
      supplierName: suppliers.name,
      warehouseId: products.warehouseId,
      warehouseName: warehouses.name,
      createdAt: products.createdAt,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(suppliers, eq(products.supplierId, suppliers.id))
    .leftJoin(warehouses, eq(products.warehouseId, warehouses.id))
    .where(eq(products.isActive, true))
    .orderBy(desc(products.createdAt));

  if (search) data = data.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );
  if (categoryId) data = data.filter((p) => p.categoryId === categoryId);
  if (filter === "low") data = data.filter((p) => p.currentStock <= p.minStock);
  if (filter === "out") data = data.filter((p) => p.currentStock === 0);

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!["admin", "manager"].includes(session?.user?.role || ""))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const [product] = await db.insert(products).values({
    name: body.name,
    sku: body.sku,
    description: body.description || null,
    categoryId: body.categoryId || null,
    supplierId: body.supplierId || null,
    warehouseId: body.warehouseId || null,
    unit: body.unit || "pcs",
    costPrice: Number(body.costPrice) || 0,
    sellingPrice: Number(body.sellingPrice) || 0,
    currentStock: Number(body.currentStock) || 0,
    minStock: Number(body.minStock) || 10,
    maxStock: Number(body.maxStock) || 1000,
  }).returning();
  return NextResponse.json(product);
}