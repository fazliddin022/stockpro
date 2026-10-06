import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categories } from "@/lib/schema";
import { auth } from "@/lib/auth-config";

export async function GET() {
  const data = await db.select().from(categories);
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!["admin", "manager"].includes(session?.user?.role || ""))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const [cat] = await db.insert(categories).values({
    name: body.name, description: body.description || null,
    color: body.color || "#6366f1", icon: body.icon || "📦",
  }).returning();
  return NextResponse.json(cat);
}