import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { warehouses } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const data = await db.select().from(warehouses).where(eq(warehouses.isActive, true));
  return NextResponse.json(data);
}