import {
  pgTable, uuid, text, integer,
  boolean, timestamp, pgEnum, doublePrecision,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["admin", "manager", "staff"]);
export const transactionTypeEnum = pgEnum("transaction_type", ["in", "out", "adjustment"]);
export const orderStatusEnum = pgEnum("order_status", ["pending", "ordered", "received", "cancelled"]);
export const unitEnum = pgEnum("unit", ["pcs", "kg", "g", "l", "ml", "m", "box", "pack"]);

// Users
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password"),
  image: text("image"),
  role: roleEnum("role").default("staff").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Categories
export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color").default("#6366f1"),
  icon: text("icon").default("📦"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Warehouses
export const warehouses = pgTable("warehouses", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  location: text("location"),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Suppliers
export const suppliers = pgTable("suppliers", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  contactPerson: text("contact_person"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Products
export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  categoryId: uuid("category_id").references(() => categories.id),
  supplierId: uuid("supplier_id").references(() => suppliers.id),
  warehouseId: uuid("warehouse_id").references(() => warehouses.id),
  name: text("name").notNull(),
  sku: text("sku").notNull().unique(),
  description: text("description"),
  unit: unitEnum("unit").default("pcs").notNull(),
  costPrice: integer("cost_price").default(0),
  sellingPrice: integer("selling_price").default(0),
  currentStock: integer("current_stock").default(0).notNull(),
  minStock: integer("min_stock").default(10).notNull(),
  maxStock: integer("max_stock").default(1000),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Stock transactions
export const transactions = pgTable("transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id").references(() => products.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  type: transactionTypeEnum("type").notNull(),
  quantity: integer("quantity").notNull(),
  previousStock: integer("previous_stock").notNull(),
  newStock: integer("new_stock").notNull(),
  unitPrice: integer("unit_price").default(0),
  totalPrice: integer("total_price").default(0),
  reference: text("reference"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Purchase orders
export const purchaseOrders = pgTable("purchase_orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  supplierId: uuid("supplier_id").references(() => suppliers.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  status: orderStatusEnum("status").default("pending").notNull(),
  totalAmount: integer("total_amount").default(0),
  notes: text("notes"),
  expectedDate: timestamp("expected_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Purchase order items
export const purchaseOrderItems = pgTable("purchase_order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id").references(() => purchaseOrders.id, { onDelete: "cascade" }).notNull(),
  productId: uuid("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: integer("unit_price").notNull(),
  totalPrice: integer("total_price").notNull(),
});

export type User = typeof users.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Warehouse = typeof warehouses.$inferSelect;
export type Supplier = typeof suppliers.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type PurchaseOrder = typeof purchaseOrders.$inferSelect;