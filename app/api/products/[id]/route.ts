import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth-config";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!["admin", "manager"].includes(session?.user?.role || ""))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const [product] = await db.update(products).set({
    name: body.name,
    sku: body.sku,
    description: body.description,
    categoryId: body.categoryId,
    supplierId: body.supplierId,
    warehouseId: body.warehouseId,
    unit: body.unit,
    costPrice: Number(body.costPrice),
    sellingPrice: Number(body.sellingPrice),
    minStock: Number(body.minStock),
    maxStock: Number(body.maxStock),
    updatedAt: new Date(),
  }).where(eq(products.id, id)).returning();
  return NextResponse.json(product);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await db.update(products).set({ isActive: false }).where(eq(products.id, id));
  return NextResponse.json({ success: true });
}