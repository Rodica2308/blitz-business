# Ghid de migrare de pe Replit pe GitHub + Vercel

Acest document oferă instrucțiuni pas cu pas pentru migrarea aplicației Blitz Business de pe Replit pe GitHub și Vercel.

## 1. Pregătire repository GitHub

1. Creează un repository nou pe GitHub (de ex. "blitz-business")
2. Clonează repository-ul pe calculatorul local:
   ```
   git clone https://github.com/username/blitz-business.git
   cd blitz-business
   ```

## 2. Export cod de pe Replit

1. Din Replit, descarcă arhiva proiectului (sau exportă prin Git)
2. Copiază fișierele în repository-ul local, ignorând fișierele specifice Replit:
   - Exclude `.replit`, `.replit.app`, `.upm/`, etc.
   - Include toate fișierele sursă, configurațiile și resursele

## 3. Pregătire pentru deployment pe Vercel

Asigură-te că următoarele fișiere sunt actualizate și prezente în repository:

1. **vercel.json** - Configurație pentru Vercel:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "package.json",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/api/(.*)",
         "dest": "/dist/index.js"
       },
       {
         "src": "/assets/(.*)",
         "dest": "/dist/public/assets/$1"
       },
       {
         "src": "/favicon.svg",
         "dest": "/dist/public/favicon.svg"
       },
       {
         "src": "/(.*\\.(js|css|jpg|jpeg|png|gif|ico|json))",
         "dest": "/dist/public/$1"
       },
       {
         "src": "/(.*)",
         "dest": "/dist/public/index.html"
       }
     ]
   }
   ```

2. **client/public/_redirects** - Pentru Netlify (opțional):
   ```
   /* /index.html 200
   ```

3. **client/404.html** - Pagină de redirecționare pentru erori 404
4. **static.json** - Pentru Heroku (opțional):
   ```json
   {
     "root": "dist/public",
     "clean_urls": true,
     "routes": {
       "/api/*": "/api/$1",
       "/**": "/index.html"
     }
   }
   ```

5. **server/simple-spa-server.ts** - Pentru servirea aplicației SPA în producție

## 4. Verificare build și deployment local

1. Rulează comanda de build pentru a verifica dacă totul funcționează:
   ```
   npm install
   npm run build
   ```

2. Testează aplicația în mod de producție:
   ```
   npm start
   ```

## 5. Deployment pe GitHub și Vercel

1. Adaugă fișierele la repository-ul Git:
   ```
   git add .
   git commit -m "Migrare de pe Replit"
   git push origin main
   ```

2. Creează un cont pe Vercel și conectează-l cu GitHub
3. Importă repository-ul în Vercel
4. Configurează proiectul:
   - Framework Preset: Other
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
5. Lansează deployment-ul și verifică funcționalitatea

## 6. Verificare routing în producție

După deployment, verifică rutele directe pentru a te asigura că nu primești erori 404:

1. Accesează URL-ul principal, de ex. `https://blitz-business.vercel.app/`
2. Accesează o rută directă, de ex. `https://blitz-business.vercel.app/businesses/1`
3. Reîncarcă pagina pentru a confirma că rutarea funcționează corect

## Notă importantă despre stocare

Aplicația curentă utilizează stocare în memorie (MemStorage) care:
- Nu persistă datele între sesiuni
- Este limitată la instanță
- Nu este potrivită pentru utilizatori multiplii

Pentru o aplicație în producție, ar trebui să:
1. Migrezi la o bază de date PostgreSQL (Supabase, Neon.tech sunt opțiuni gratuite)
2. Implementezi funcționalitate de backup și restaurare
3. Implementezi autentificare pentru utilizatorii finali