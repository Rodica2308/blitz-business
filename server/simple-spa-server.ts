import path from 'path';
import fs from 'fs';
import express, { Request, Response, NextFunction, Application } from 'express';

// Această funcție ajută la servirea aplicației SPA în producție
// Toate rutele necunoscute vor fi redirecționate către index.html
export function setupSPAServer(app: Application) {
  const distPath = path.resolve(process.cwd(), 'dist', 'public');
  
  // Verificare dacă directorul dist/public există
  if (!fs.existsSync(distPath)) {
    console.warn('Directorul dist/public nu există. Serverul SPA nu va funcționa corect.');
    return;
  }
  
  console.log(`Servesc fișierele statice din: ${distPath}`);
  
  // Servirea fișierelor statice
  app.use(express.static(distPath));
  
  // Redirecționarea tuturor rutelor necunoscute către index.html
  // Cu excepția rutelor API
  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    // Rulăm mai departe rutele API
    if (req.path.startsWith('/api')) {
      return next();
    }
    
    // Pentru toate celelalte rute, servim index.html
    res.sendFile(path.join(distPath, 'index.html'));
  });
  
  console.log('Server SPA configurat cu succes!');
}