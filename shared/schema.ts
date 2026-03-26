import { pgTable, text, serial, integer, boolean, doublePrecision, jsonb, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Schema pentru autentificare
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

// Schema pentru afaceri
export const businesses = pgTable("businesses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  ownerName: text("owner_name").notNull(),
  category: text("category"), // tipul afacerii
  initialCapital: numeric("initial_capital").default("0"), // capital inițial în lei
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
  updatedAt: text("updated_at").notNull().default(new Date().toISOString()),
});

// Schema pentru tipuri de cheltuieli
export enum ExpenseType {
  RAW_MATERIALS = "materii_prime",
  MATERIALS = "materiale",
  SUPPLIERS = "furnizori",
  TRANSPORTATION = "transport",
  DISTRIBUTION = "desfacere",
  OTHER = "altele"
}

// Schema pentru cheltuieli
export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  type: text("type").notNull(), // din ExpenseType
  description: text("description"),
  amount: numeric("amount").notNull(), // suma în lei
  date: text("date").notNull().default(new Date().toISOString()),
});

// Schema pentru produse/servicii
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  unitPrice: numeric("unit_price").notNull(), // pret per unitate
  quantity: numeric("quantity").notNull(), // cantitatea vândută
  unit: text("unit"), // unitatea de măsură (buc, kg, etc.)
});

// Schema pentru inserare de afaceri
export const insertBusinessSchema = createInsertSchema(businesses).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Schema pentru inserare de cheltuieli
export const insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
  date: true
});

// Schema pentru inserare de produse
export const insertProductSchema = createInsertSchema(products).omit({
  id: true
});

// Validări personalizate
export const businessFormSchema = insertBusinessSchema.extend({
  name: z.string().min(3, "Numele afacerii trebuie să aibă minim 3 caractere").max(50, "Numele afacerii trebuie să aibă maxim 50 caractere"),
  ownerName: z.string().min(3, "Numele proprietarului trebuie să aibă minim 3 caractere")
});

export const expenseFormSchema = insertExpenseSchema.extend({
  amount: z.coerce.number().positive("Suma trebuie să fie pozitivă"),
  type: z.nativeEnum(ExpenseType, {
    errorMap: () => ({ message: "Alegeți un tip valid de cheltuială" })
  })
});

export const productFormSchema = insertProductSchema.extend({
  unitPrice: z.coerce.number().positive("Prețul trebuie să fie pozitiv"),
  quantity: z.coerce.number().positive("Cantitatea trebuie să fie pozitivă"),
  name: z.string().min(2, "Numele produsului trebuie să aibă minim 2 caractere")
});

// Schema pentru inserare de utilizatori
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});

// Schema pentru autentificare
export const loginSchema = z.object({
  username: z.string().min(3, "Numele de utilizator trebuie să aibă minim 3 caractere"),
  password: z.string().min(6, "Parola trebuie să aibă minim 6 caractere")
});

// Tipuri pentru entități
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;

export type Business = typeof businesses.$inferSelect;
export type InsertBusiness = z.infer<typeof insertBusinessSchema>;
export type BusinessFormValues = z.infer<typeof businessFormSchema>;

export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type ProductFormValues = z.infer<typeof productFormSchema>;
