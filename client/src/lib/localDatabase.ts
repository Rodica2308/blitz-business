import { ExpenseType } from "@shared/schema";

interface StoredBusiness {
  id: number;
  name: string;
  description: string | null;
  ownerName: string;
  category: string | null;
  initialCapital: string;
  createdAt: string;
  updatedAt: string;
}

interface StoredExpense {
  id: number;
  businessId: number;
  type: string;
  description: string | null;
  amount: string;
  date: string;
}

interface StoredProduct {
  id: number;
  businessId: number;
  name: string;
  description: string | null;
  unitPrice: string;
  quantity: string;
  unit: string | null;
}

const KEYS = {
  businesses: "bb_businesses",
  expenses: "bb_expenses",
  products: "bb_products",
  password: "bb_password",
  nextIds: "bb_next_ids",
};

const DEFAULT_PASSWORD = "djst";

function getItems<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setItems<T>(key: string, items: T[]): void {
  localStorage.setItem(key, JSON.stringify(items));
}

function getNextId(entity: string): number {
  const ids = JSON.parse(localStorage.getItem(KEYS.nextIds) || "{}");
  const current = ids[entity] || 1;
  ids[entity] = current + 1;
  localStorage.setItem(KEYS.nextIds, JSON.stringify(ids));
  return current;
}

function getPassword(): string {
  return localStorage.getItem(KEYS.password) || DEFAULT_PASSWORD;
}

function setPassword(pwd: string): void {
  localStorage.setItem(KEYS.password, pwd);
}

export function handleLocalApi(url: string, method: string, data?: any): any {
  if (url === "/api/verify-password" && method === "POST") {
    const stored = getPassword();
    if (data?.password === stored) {
      return { message: "Parolă validă" };
    }
    throw new Error("Parolă invalidă");
  }

  if (url === "/api/change-password" && method === "POST") {
    const stored = getPassword();
    if (data?.currentPassword !== stored) {
      throw new Error("Parola curentă este incorectă");
    }
    setPassword(data.newPassword);
    return { message: "Parola a fost schimbată cu succes" };
  }

  if (url === "/api/businesses" && method === "GET") {
    return getItems<StoredBusiness>(KEYS.businesses);
  }

  if (url === "/api/businesses" && method === "POST") {
    const businesses = getItems<StoredBusiness>(KEYS.businesses);
    const now = new Date().toISOString();
    const business: StoredBusiness = {
      id: getNextId("business"),
      name: data.name,
      description: data.description || null,
      ownerName: data.ownerName,
      category: data.category || null,
      initialCapital: data.initialCapital || "0",
      createdAt: now,
      updatedAt: now,
    };
    businesses.push(business);
    setItems(KEYS.businesses, businesses);
    return business;
  }

  const businessByIdMatch = url.match(/^\/api\/businesses\/(\d+)$/);
  if (businessByIdMatch && method === "GET") {
    const id = Number(businessByIdMatch[1]);
    const businesses = getItems<StoredBusiness>(KEYS.businesses);
    const biz = businesses.find((b) => b.id === id);
    if (!biz) throw new Error("Afacerea nu a fost găsită");
    return biz;
  }

  if (businessByIdMatch && method === "PUT") {
    const id = Number(businessByIdMatch[1]);
    const businesses = getItems<StoredBusiness>(KEYS.businesses);
    const idx = businesses.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error("Afacerea nu a fost găsită");
    businesses[idx] = {
      ...businesses[idx],
      ...data,
      description: "description" in data ? data.description || null : businesses[idx].description,
      category: "category" in data ? data.category || null : businesses[idx].category,
      updatedAt: new Date().toISOString(),
    };
    setItems(KEYS.businesses, businesses);
    return businesses[idx];
  }

  if (businessByIdMatch && method === "DELETE") {
    const id = Number(businessByIdMatch[1]);
    const businesses = getItems<StoredBusiness>(KEYS.businesses);
    const idx = businesses.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error("Afacerea nu a fost găsită");
    businesses.splice(idx, 1);
    setItems(KEYS.businesses, businesses);
    const expenses = getItems<StoredExpense>(KEYS.expenses).filter((e) => e.businessId !== id);
    setItems(KEYS.expenses, expenses);
    const products = getItems<StoredProduct>(KEYS.products).filter((p) => p.businessId !== id);
    setItems(KEYS.products, products);
    return {};
  }

  const updateCapitalMatch = url.match(/^\/api\/businesses\/(\d+)\/update-capital$/);
  if (updateCapitalMatch && method === "POST") {
    const id = Number(updateCapitalMatch[1]);
    const businesses = getItems<StoredBusiness>(KEYS.businesses);
    const idx = businesses.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error("Afacerea nu a fost găsită");
    if (data?.initialCapital === undefined || isNaN(Number(data.initialCapital))) {
      throw new Error("Capitalul inițial trebuie să fie un număr valid");
    }
    businesses[idx].initialCapital = String(data.initialCapital);
    businesses[idx].updatedAt = new Date().toISOString();
    setItems(KEYS.businesses, businesses);
    return businesses[idx];
  }

  const expensesMatch = url.match(/^\/api\/businesses\/(\d+)\/expenses$/);
  if (expensesMatch && method === "GET") {
    const businessId = Number(expensesMatch[1]);
    return getItems<StoredExpense>(KEYS.expenses).filter((e) => e.businessId === businessId);
  }

  if (expensesMatch && method === "POST") {
    const businessId = Number(expensesMatch[1]);
    const expenses = getItems<StoredExpense>(KEYS.expenses);
    const expense: StoredExpense = {
      id: getNextId("expense"),
      businessId,
      type: data.type,
      description: data.description || null,
      amount: String(data.amount),
      date: new Date().toISOString(),
    };
    expenses.push(expense);
    setItems(KEYS.expenses, expenses);
    return expense;
  }

  const expenseByIdMatch = url.match(/^\/api\/expenses\/(\d+)$/);
  if (expenseByIdMatch && method === "PUT") {
    const id = Number(expenseByIdMatch[1]);
    const expenses = getItems<StoredExpense>(KEYS.expenses);
    const idx = expenses.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error("Cheltuiala nu a fost găsită");
    if (data.type !== undefined) expenses[idx].type = data.type;
    if (data.amount !== undefined) expenses[idx].amount = String(data.amount);
    if ("description" in data) expenses[idx].description = data.description || null;
    setItems(KEYS.expenses, expenses);
    return expenses[idx];
  }

  if (expenseByIdMatch && method === "DELETE") {
    const id = Number(expenseByIdMatch[1]);
    const expenses = getItems<StoredExpense>(KEYS.expenses);
    const idx = expenses.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error("Cheltuiala nu a fost găsită");
    expenses.splice(idx, 1);
    setItems(KEYS.expenses, expenses);
    return {};
  }

  const productsMatch = url.match(/^\/api\/businesses\/(\d+)\/products$/);
  if (productsMatch && method === "GET") {
    const businessId = Number(productsMatch[1]);
    return getItems<StoredProduct>(KEYS.products).filter((p) => p.businessId === businessId);
  }

  if (productsMatch && method === "POST") {
    const businessId = Number(productsMatch[1]);
    const products = getItems<StoredProduct>(KEYS.products);
    const product: StoredProduct = {
      id: getNextId("product"),
      businessId,
      name: data.name,
      description: data.description || null,
      unitPrice: String(data.unitPrice),
      quantity: String(data.quantity),
      unit: data.unit || null,
    };
    products.push(product);
    setItems(KEYS.products, products);
    return product;
  }

  const productByIdMatch = url.match(/^\/api\/products\/(\d+)$/);
  if (productByIdMatch && method === "PUT") {
    const id = Number(productByIdMatch[1]);
    const products = getItems<StoredProduct>(KEYS.products);
    const idx = products.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error("Produsul nu a fost găsit");
    if (data.name !== undefined) products[idx].name = data.name;
    if (data.unitPrice !== undefined) products[idx].unitPrice = String(data.unitPrice);
    if (data.quantity !== undefined) products[idx].quantity = String(data.quantity);
    if ("description" in data) products[idx].description = data.description || null;
    if ("unit" in data) products[idx].unit = data.unit || null;
    setItems(KEYS.products, products);
    return products[idx];
  }

  if (productByIdMatch && method === "DELETE") {
    const id = Number(productByIdMatch[1]);
    const products = getItems<StoredProduct>(KEYS.products);
    const idx = products.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error("Produsul nu a fost găsit");
    products.splice(idx, 1);
    setItems(KEYS.products, products);
    return {};
  }

  const financialMatch = url.match(/^\/api\/businesses\/(\d+)\/financial-summary$/);
  if (financialMatch && method === "GET") {
    const businessId = Number(financialMatch[1]);
    const businesses = getItems<StoredBusiness>(KEYS.businesses);
    const business = businesses.find((b) => b.id === businessId);
    if (!business) throw new Error("Afacerea nu a fost găsită");

    const expenses = getItems<StoredExpense>(KEYS.expenses).filter((e) => e.businessId === businessId);
    const products = getItems<StoredProduct>(KEYS.products).filter((p) => p.businessId === businessId);

    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const totalRevenue = products.reduce((sum, p) => sum + Number(p.unitPrice) * Number(p.quantity), 0);
    const profit = totalRevenue - totalExpenses;

    const expensesByType: Record<string, number> = {};
    expenses.forEach((e) => {
      expensesByType[e.type] = (expensesByType[e.type] || 0) + Number(e.amount);
    });

    const initialCapital = business.initialCapital ? Number(business.initialCapital) : 0;

    return {
      business: business.name,
      totalExpenses,
      totalRevenue,
      profit,
      initialCapital,
      exceedsInitialCapital: initialCapital > 0 && totalExpenses > initialCapital,
      expensesByType,
      products: products.map((p) => ({
        name: p.name,
        revenue: Number(p.unitPrice) * Number(p.quantity),
        quantity: Number(p.quantity),
        unitPrice: Number(p.unitPrice),
      })),
    };
  }

  throw new Error(`Rută necunoscută: ${method} ${url}`);
}