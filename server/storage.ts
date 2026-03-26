import { 
  type Business, type InsertBusiness, 
  type Expense, type InsertExpense,
  type Product, type InsertProduct,
  type User, type InsertUser,
  businesses, expenses, products, users,
  ExpenseType
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUsers(): Promise<User[]>;
  getUserById(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
  // Business operations
  getBusinesses(): Promise<Business[]>;
  getBusinessById(id: number): Promise<Business | undefined>;
  createBusiness(business: InsertBusiness): Promise<Business>;
  updateBusiness(id: number, business: Partial<InsertBusiness>): Promise<Business | undefined>;
  deleteBusiness(id: number): Promise<boolean>;
  
  // Expense operations
  getExpenses(businessId: number): Promise<Expense[]>;
  getExpenseById(id: number): Promise<Expense | undefined>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(id: number, expense: Partial<InsertExpense>): Promise<Expense | undefined>;
  deleteExpense(id: number): Promise<boolean>;
  
  // Product operations
  getProducts(businessId: number): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private businesses: Map<number, Business>;
  private expenses: Map<number, Expense>;
  private products: Map<number, Product>;
  
  private userCurrentId: number;
  private businessCurrentId: number;
  private expenseCurrentId: number;
  private productCurrentId: number;

  constructor() {
    this.users = new Map();
    this.businesses = new Map();
    this.expenses = new Map();
    this.products = new Map();
    
    this.userCurrentId = 1;
    this.businessCurrentId = 1;
    this.expenseCurrentId = 1;
    this.productCurrentId = 1;
    
    // Nu mai adăugăm date demonstrative
  }
  
  // User methods
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUserById(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    
    const user: User = {
      ...insertUser,
      id,
      isAdmin: insertUser.isAdmin !== undefined ? insertUser.isAdmin : false,
      createdAt: new Date().toISOString()
    };
    
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    
    if (!existingUser) {
      return undefined;
    }
    
    const updatedUser: User = {
      ...existingUser,
      ...updateData,
      isAdmin: 'isAdmin' in updateData ? (updateData.isAdmin !== undefined ? updateData.isAdmin : existingUser.isAdmin) : existingUser.isAdmin
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }

  // Business methods
  async getBusinesses(): Promise<Business[]> {
    return Array.from(this.businesses.values());
  }

  async getBusinessById(id: number): Promise<Business | undefined> {
    return this.businesses.get(id);
  }

  async createBusiness(insertBusiness: InsertBusiness): Promise<Business> {
    const id = this.businessCurrentId++;
    const now = new Date().toISOString();
    
    const business: Business = {
      ...insertBusiness,
      id,
      description: insertBusiness.description || null,
      category: insertBusiness.category || null,
      initialCapital: insertBusiness.initialCapital !== undefined ? insertBusiness.initialCapital : "0",
      createdAt: now,
      updatedAt: now
    };
    
    this.businesses.set(id, business);
    return business;
  }

  async updateBusiness(id: number, updateData: Partial<InsertBusiness>): Promise<Business | undefined> {
    const existingBusiness = this.businesses.get(id);
    
    if (!existingBusiness) {
      return undefined;
    }
    
    const updatedBusiness: Business = {
      ...existingBusiness,
      ...updateData,
      description: 'description' in updateData ? (updateData.description || null) : existingBusiness.description,
      category: 'category' in updateData ? (updateData.category || null) : existingBusiness.category,
      initialCapital: 'initialCapital' in updateData ? (updateData.initialCapital !== undefined ? updateData.initialCapital : existingBusiness.initialCapital) : existingBusiness.initialCapital,
      updatedAt: new Date().toISOString()
    };
    
    this.businesses.set(id, updatedBusiness);
    return updatedBusiness;
  }

  async deleteBusiness(id: number): Promise<boolean> {
    // Ștergem și cheltuielile asociate
    const businessExpenses = Array.from(this.expenses.values())
      .filter(expense => expense.businessId === id);
      
    for (const expense of businessExpenses) {
      this.expenses.delete(expense.id);
    }
    
    // Ștergem și produsele asociate
    const businessProducts = Array.from(this.products.values())
      .filter(product => product.businessId === id);
      
    for (const product of businessProducts) {
      this.products.delete(product.id);
    }
    
    return this.businesses.delete(id);
  }

  // Expense methods
  async getExpenses(businessId: number): Promise<Expense[]> {
    return Array.from(this.expenses.values())
      .filter(expense => expense.businessId === businessId);
  }

  async getExpenseById(id: number): Promise<Expense | undefined> {
    return this.expenses.get(id);
  }

  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const id = this.expenseCurrentId++;
    
    const expense: Expense = {
      ...insertExpense,
      id,
      description: insertExpense.description || null,
      date: new Date().toISOString()
    };
    
    this.expenses.set(id, expense);
    return expense;
  }

  async updateExpense(id: number, updateData: Partial<InsertExpense>): Promise<Expense | undefined> {
    const existingExpense = this.expenses.get(id);
    
    if (!existingExpense) {
      return undefined;
    }
    
    const updatedExpense: Expense = {
      ...existingExpense,
      ...updateData,
      description: 'description' in updateData ? (updateData.description || null) : existingExpense.description
    };
    
    this.expenses.set(id, updatedExpense);
    return updatedExpense;
  }

  async deleteExpense(id: number): Promise<boolean> {
    return this.expenses.delete(id);
  }

  // Product methods
  async getProducts(businessId: number): Promise<Product[]> {
    return Array.from(this.products.values())
      .filter(product => product.businessId === businessId);
  }

  async getProductById(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.productCurrentId++;
    
    const product: Product = {
      ...insertProduct,
      id,
      description: insertProduct.description || null,
      unit: insertProduct.unit || null
    };
    
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: number, updateData: Partial<InsertProduct>): Promise<Product | undefined> {
    const existingProduct = this.products.get(id);
    
    if (!existingProduct) {
      return undefined;
    }
    
    const updatedProduct: Product = {
      ...existingProduct,
      ...updateData,
      description: 'description' in updateData ? (updateData.description || null) : existingProduct.description,
      unit: 'unit' in updateData ? (updateData.unit || null) : existingProduct.unit
    };
    
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }
}

export const storage = new MemStorage();
