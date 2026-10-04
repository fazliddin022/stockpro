import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, categories, warehouses, suppliers, products, transactions } from "@/lib/schema";
import bcrypt from "bcryptjs";

export async function GET() {
  const [admin] = await db.insert(users).values({
    name: "Admin User",
    email: "admin@stockpro.com",
    password: await bcrypt.hash("admin123", 10),
    role: "admin",
  }).returning().onConflictDoNothing();

  if (!admin) return NextResponse.json({ message: "Already seeded" });

  const [manager] = await db.insert(users).values({
    name: "John Manager",
    email: "manager@stockpro.com",
    password: await bcrypt.hash("manager123", 10),
    role: "manager",
  }).returning();

  await db.insert(users).values({
    name: "Staff User",
    email: "staff@stockpro.com",
    password: await bcrypt.hash("staff123", 10),
    role: "staff",
  });

  // Categories
  const cats = await db.insert(categories).values([
    { name: "Electronics", description: "Electronic devices and accessories", color: "#6366f1", icon: "💻" },
    { name: "Office Supplies", description: "Stationery and office items", color: "#f59e0b", icon: "📎" },
    { name: "Furniture", description: "Office and home furniture", color: "#10b981", icon: "🪑" },
    { name: "Food & Beverages", description: "Consumables and drinks", color: "#ef4444", icon: "🍎" },
    { name: "Clothing", description: "Apparel and accessories", color: "#8b5cf6", icon: "👕" },
    { name: "Tools", description: "Hardware and tools", color: "#06b6d4", icon: "🔧" },
  ]).returning();

  // Warehouses
  const whs = await db.insert(warehouses).values([
    { name: "Main Warehouse", location: "Tashkent, Chilonzor", description: "Primary storage facility" },
    { name: "Branch A", location: "Tashkent, Yunusobod", description: "Secondary storage" },
  ]).returning();

  // Suppliers
  const sups = await db.insert(suppliers).values([
    { name: "TechWorld LLC", email: "tech@techworld.uz", phone: "+998901234567", address: "Tashkent, IT Park", contactPerson: "Alibek Yusupov" },
    { name: "Office Masters", email: "info@officemasters.uz", phone: "+998902345678", address: "Tashkent, Mirzo Ulugbek", contactPerson: "Dilnoza Karimova" },
    { name: "FurniPro", email: "sales@furnipro.uz", phone: "+998903456789", address: "Tashkent, Shayxontohur", contactPerson: "Sardor Rahimov" },
  ]).returning();

  // Products
  const prods = await db.insert(products).values([
    { name: "Laptop Dell XPS 15", sku: "DELL-XPS15-001", categoryId: cats[0].id, supplierId: sups[0].id, warehouseId: whs[0].id, unit: "pcs", costPrice: 8500000, sellingPrice: 10500000, currentStock: 15, minStock: 5, maxStock: 50 },
    { name: "iPhone 15 Pro", sku: "APL-IP15P-001", categoryId: cats[0].id, supplierId: sups[0].id, warehouseId: whs[0].id, unit: "pcs", costPrice: 12000000, sellingPrice: 14500000, currentStock: 8, minStock: 5, maxStock: 30 },
    { name: "Samsung Monitor 27\"", sku: "SAM-MON27-001", categoryId: cats[0].id, supplierId: sups[0].id, warehouseId: whs[0].id, unit: "pcs", costPrice: 2800000, sellingPrice: 3500000, currentStock: 3, minStock: 5, maxStock: 20 },
    { name: "Wireless Keyboard", sku: "KEY-WRL-001", categoryId: cats[0].id, supplierId: sups[0].id, warehouseId: whs[1].id, unit: "pcs", costPrice: 350000, sellingPrice: 500000, currentStock: 25, minStock: 10, maxStock: 100 },
    { name: "A4 Paper (500 sheets)", sku: "PAP-A4-001", categoryId: cats[1].id, supplierId: sups[1].id, warehouseId: whs[0].id, unit: "pack", costPrice: 35000, sellingPrice: 50000, currentStock: 150, minStock: 50, maxStock: 500 },
    { name: "Blue Ballpoint Pen", sku: "PEN-BLU-001", categoryId: cats[1].id, supplierId: sups[1].id, warehouseId: whs[0].id, unit: "pcs", costPrice: 3000, sellingPrice: 5000, currentStock: 200, minStock: 50, maxStock: 1000 },
    { name: "Office Chair", sku: "CHR-OFF-001", categoryId: cats[2].id, supplierId: sups[2].id, warehouseId: whs[0].id, unit: "pcs", costPrice: 1200000, sellingPrice: 1800000, currentStock: 10, minStock: 3, maxStock: 30 },
    { name: "Standing Desk", sku: "DSK-STD-001", categoryId: cats[2].id, supplierId: sups[2].id, warehouseId: whs[0].id, unit: "pcs", costPrice: 2500000, sellingPrice: 3500000, currentStock: 4, minStock: 2, maxStock: 15 },
    { name: "Drill Machine", sku: "DRL-ELC-001", categoryId: cats[5].id, supplierId: sups[2].id, warehouseId: whs[1].id, unit: "pcs", costPrice: 450000, sellingPrice: 650000, currentStock: 2, minStock: 3, maxStock: 20 },
    { name: "Screwdriver Set", sku: "SCR-SET-001", categoryId: cats[5].id, supplierId: sups[2].id, warehouseId: whs[1].id, unit: "pcs", costPrice: 85000, sellingPrice: 130000, currentStock: 12, minStock: 5, maxStock: 50 },
  ]).returning();

  // Sample transactions
  await db.insert(transactions).values([
    { productId: prods[0].id, userId: admin.id, type: "in", quantity: 20, previousStock: 0, newStock: 20, unitPrice: 8500000, totalPrice: 170000000, reference: "PO-2026-001", notes: "Initial stock" },
    { productId: prods[0].id, userId: manager.id, type: "out", quantity: 5, previousStock: 20, newStock: 15, unitPrice: 10500000, totalPrice: 52500000, reference: "SO-2026-001", notes: "Sale to client" },
    { productId: prods[1].id, userId: admin.id, type: "in", quantity: 10, previousStock: 0, newStock: 10, unitPrice: 12000000, totalPrice: 120000000, reference: "PO-2026-002" },
    { productId: prods[1].id, userId: manager.id, type: "out", quantity: 2, previousStock: 10, newStock: 8, unitPrice: 14500000, totalPrice: 29000000, reference: "SO-2026-002" },
    { productId: prods[4].id, userId: admin.id, type: "in", quantity: 200, previousStock: 0, newStock: 200, unitPrice: 35000, totalPrice: 7000000, reference: "PO-2026-003" },
    { productId: prods[4].id, userId: manager.id, type: "out", quantity: 50, previousStock: 200, newStock: 150, unitPrice: 50000, totalPrice: 2500000, reference: "SO-2026-003" },
  ]);

  return NextResponse.json({ success: true });
}