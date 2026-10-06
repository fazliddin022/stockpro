import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { transactions, products, users } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth-config";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "";

  let data = await db
    .select({
      id: transactions.id,
      type: transactions.type,
      quantity: transactions.quantity,
      previousStock: transactions.previousStock,
      newStock: transactions.newStock,
      unitPrice: transactions.unitPrice,
      totalPrice: transactions.totalPrice,
      reference: transactions.reference,
      notes: transactions.notes,
      createdAt: transactions.createdAt,
      productId: transactions.productId,
      productName: products.name,
      productSku: products.sku,
      productUnit: products.unit,
      userId: transactions.userId,
      userName: users.name,
    })
    .from(transactions)
    .innerJoin(products, eq(transactions.productId, products.id))
    .innerJoin(users, eq(transactions.userId, users.id))
    .orderBy(desc(transactions.createdAt))
    .limit(100);

  if (type) data = data.filter((t) => t.type === type);
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const [product] = await db.select().from(products).where(eq(products.id, body.productId));
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const quantity = Number(body.quantity);
  let newStock = product.currentStock;

  if (body.type === "in") newStock += quantity;
  else if (body.type === "out") {
    if (product.currentStock < quantity) return NextResponse.json({ error: "Insufficient stock!" }, { status: 400 });
    newStock -= quantity;
  } else if (body.type === "adjustment") newStock = quantity;

  const [tx] = await db.insert(transactions).values({
    productId: body.productId,
    userId: session.user.id,
    type: body.type,
    quantity,
    previousStock: product.currentStock,
    newStock,
    unitPrice: Number(body.unitPrice) || 0,
    totalPrice: (Number(body.unitPrice) || 0) * quantity,
    reference: body.reference || null,
    notes: body.notes || null,
  }).returning();

  await db.update(products).set({ currentStock: newStock, updatedAt: new Date() }).where(eq(products.id, body.productId));

  return NextResponse.json(tx);
}