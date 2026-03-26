import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertBusinessSchema, insertExpenseSchema, insertProductSchema,
  businessFormSchema, expenseFormSchema, productFormSchema,
  InsertExpense, InsertProduct, ExpenseType
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { verifyPassword, changePassword } from "./password";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post('/api/verify-password', async (req, res) => {
    try {
      const { password } = req.body;
      
      if (!password) {
        return res.status(400).json({ message: "Parola este necesară" });
      }
      
      const isValid = await verifyPassword(password);
      
      if (isValid) {
        res.status(200).json({ message: "Parolă validă" });
      } else {
        res.status(401).json({ message: "Parolă invalidă" });
      }
    } catch (error) {
      res.status(500).json({ message: "Eroare internă la verificarea parolei" });
    }
  });
  
  app.post('/api/change-password', async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Ambele parole sunt necesare" });
      }
      
      const isValid = await verifyPassword(currentPassword);
      
      if (!isValid) {
        return res.status(401).json({ message: "Parola curentă este incorectă" });
      }
      
      const isChanged = await changePassword(newPassword);
      
      if (isChanged) {
        res.status(200).json({ message: "Parola a fost schimbată cu succes" });
      } else {
        res.status(500).json({ message: "Eroare la schimbarea parolei" });
      }
    } catch (error) {
      res.status(500).json({ message: "Eroare internă la schimbarea parolei" });
    }
  });

  app.get('/api/businesses', async (req, res) => {
    try {
      const businesses = await storage.getBusinesses();
      res.json(businesses);
    } catch (error) {
      res.status(500).json({ message: "Eroare la obținerea afacerilor" });
    }
  });

  app.get('/api/businesses/:id', async (req, res) => {
    try {
      const business = await storage.getBusinessById(Number(req.params.id));
      if (!business) {
        return res.status(404).json({ message: "Afacerea nu a fost găsită" });
      }
      res.json(business);
    } catch (error) {
      res.status(500).json({ message: "Eroare la obținerea afacerii" });
    }
  });

  app.post('/api/businesses', async (req, res) => {
    try {
      const businessData = businessFormSchema.parse(req.body);
      const business = await storage.createBusiness(businessData);
      res.status(201).json(business);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Eroare la crearea afacerii" });
    }
  });

  app.put('/api/businesses/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const businessData = businessFormSchema.partial().parse(req.body);
      const business = await storage.updateBusiness(id, businessData);
      
      if (!business) {
        return res.status(404).json({ message: "Afacerea nu a fost găsită" });
      }
      
      res.json(business);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Eroare la actualizarea afacerii" });
    }
  });

  app.delete('/api/businesses/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const success = await storage.deleteBusiness(id);
      
      if (!success) {
        return res.status(404).json({ message: "Afacerea nu a fost găsită" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Eroare la ștergerea afacerii" });
    }
  });

  app.get('/api/businesses/:businessId/expenses', async (req, res) => {
    try {
      const businessId = Number(req.params.businessId);
      const business = await storage.getBusinessById(businessId);
      
      if (!business) {
        return res.status(404).json({ message: "Afacerea nu a fost găsită" });
      }
      
      const expenses = await storage.getExpenses(businessId);
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ message: "Eroare la obținerea cheltuielilor" });
    }
  });

  app.post('/api/businesses/:businessId/expenses', async (req, res) => {
    try {
      const businessId = Number(req.params.businessId);
      const business = await storage.getBusinessById(businessId);
      
      if (!business) {
        return res.status(404).json({ message: "Afacerea nu a fost găsită" });
      }
      
      const rawData = { ...req.body, businessId };
      const validatedData = expenseFormSchema.parse(rawData);
      const expenseData = {
        ...validatedData,
        amount: String(validatedData.amount)
      };
      
      const expense = await storage.createExpense(expenseData);
      res.status(201).json(expense);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Eroare la adăugarea cheltuielii" });
    }
  });

  app.put('/api/expenses/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const validatedData = expenseFormSchema.partial().parse(req.body);
      
      delete (validatedData as any).businessId;
      
      const expenseData: Partial<InsertExpense> = {
        ...validatedData,
        amount: validatedData.amount !== undefined ? String(validatedData.amount) : undefined
      };
      
      const expense = await storage.updateExpense(id, expenseData);
      
      if (!expense) {
        return res.status(404).json({ message: "Cheltuiala nu a fost găsită" });
      }
      
      res.json(expense);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Eroare la actualizarea cheltuielii" });
    }
  });

  app.delete('/api/expenses/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const success = await storage.deleteExpense(id);
      
      if (!success) {
        return res.status(404).json({ message: "Cheltuiala nu a fost găsită" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Eroare la ștergerea cheltuielii" });
    }
  });

  app.get('/api/businesses/:businessId/products', async (req, res) => {
    try {
      const businessId = Number(req.params.businessId);
      const business = await storage.getBusinessById(businessId);
      
      if (!business) {
        return res.status(404).json({ message: "Afacerea nu a fost găsită" });
      }
      
      const products = await storage.getProducts(businessId);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Eroare la obținerea produselor" });
    }
  });

  app.post('/api/businesses/:businessId/products', async (req, res) => {
    try {
      const businessId = Number(req.params.businessId);
      const business = await storage.getBusinessById(businessId);
      
      if (!business) {
        return res.status(404).json({ message: "Afacerea nu a fost găsită" });
      }
      
      const rawData = { ...req.body, businessId };
      const validatedData = productFormSchema.parse(rawData);
      const productData = {
        ...validatedData,
        unitPrice: String(validatedData.unitPrice),
        quantity: String(validatedData.quantity)
      };
      
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Eroare la adăugarea produsului" });
    }
  });

  app.put('/api/products/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const validatedData = productFormSchema.partial().parse(req.body);
      
      delete (validatedData as any).businessId;
      
      const productData: Partial<InsertProduct> = {
        ...validatedData,
        unitPrice: validatedData.unitPrice !== undefined ? String(validatedData.unitPrice) : undefined,
        quantity: validatedData.quantity !== undefined ? String(validatedData.quantity) : undefined
      };
      
      const product = await storage.updateProduct(id, productData);
      
      if (!product) {
        return res.status(404).json({ message: "Produsul nu a fost găsit" });
      }
      
      res.json(product);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Eroare la actualizarea produsului" });
    }
  });

  app.delete('/api/products/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const success = await storage.deleteProduct(id);
      
      if (!success) {
        return res.status(404).json({ message: "Produsul nu a fost găsit" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Eroare la ștergerea produsului" });
    }
  });

  app.post('/api/businesses/:id/update-capital', async (req, res) => {
    try {
      const businessId = Number(req.params.id);
      const business = await storage.getBusinessById(businessId);
      
      if (!business) {
        return res.status(404).json({ message: "Afacerea nu a fost găsită" });
      }
      
      const { initialCapital } = req.body;
      
      if (initialCapital === undefined || isNaN(Number(initialCapital))) {
        return res.status(400).json({ message: "Capitalul inițial trebuie să fie un număr valid" });
      }
      
      const updatedBusiness = await storage.updateBusiness(businessId, { 
        initialCapital: initialCapital.toString() 
      });
      
      if (!updatedBusiness) {
        return res.status(404).json({ message: "Afacerea nu a fost găsită" });
      }
      
      res.json(updatedBusiness);
    } catch (error) {
      res.status(500).json({ message: "Eroare la actualizarea capitalului inițial" });
    }
  });

  app.get('/api/businesses/:businessId/financial-summary', async (req, res) => {
    try {
      const businessId = Number(req.params.businessId);
      const business = await storage.getBusinessById(businessId);
      
      if (!business) {
        return res.status(404).json({ message: "Afacerea nu a fost găsită" });
      }
      
      const expenses = await storage.getExpenses(businessId);
      const products = await storage.getProducts(businessId);
      
      const totalExpenses = expenses.reduce((sum, expense) => {
        return sum + Number(expense.amount);
      }, 0);
      
      const totalRevenue = products.reduce((sum, product) => {
        return sum + (Number(product.unitPrice) * Number(product.quantity));
      }, 0);
      
      const profit = totalRevenue - totalExpenses;
      
      const expensesByType: Record<string, number> = {};
      expenses.forEach(expense => {
        if (!expensesByType[expense.type]) {
          expensesByType[expense.type] = 0;
        }
        expensesByType[expense.type] += Number(expense.amount);
      });
      
      const initialCapital = business.initialCapital ? Number(business.initialCapital) : 0;
      
      res.json({
        business: business.name,
        totalExpenses,
        totalRevenue,
        profit,
        initialCapital,
        exceedsInitialCapital: initialCapital > 0 && totalExpenses > initialCapital,
        expensesByType,
        products: products.map(p => ({
          name: p.name,
          revenue: Number(p.unitPrice) * Number(p.quantity),
          quantity: Number(p.quantity),
          unitPrice: Number(p.unitPrice)
        }))
      });
    } catch (error) {
      res.status(500).json({ message: "Eroare la calcularea sumarului financiar" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}