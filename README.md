# Blitz Business - Platformă Educațională pentru Planuri de Afaceri

O platformă educațională dedicată dezvoltării planurilor de afaceri pentru studenți din România. Aplicația permite crearea, gestionarea și analiza planurilor de afaceri, inclusiv calcularea cheltuielilor, veniturilor și profitului.

## Rezolvarea problemelor de rutare în producție

Acest proiect include soluții pentru problema rutelor 404 în producție (când utilizatorul accesează direct o rută precum `/businesses/1`). Aceste soluții sunt:

1. **Configurare Vercel** - Fișierul `vercel.json` definește reguli de rutare pentru a redirecționa toate cererile non-API către aplicația SPA.
2. **Configurare Express** - Fișierul `server/simple-spa-server.ts` include logica pentru a servi `index.html` pentru toate rutele non-API.
3. **Configurare Netlify** - Fișierul `client/public/_redirects` definește reguli de redirectare pentru Netlify.
4. **Pagină 404 personalizată** - Fișierul `client/404.html` asigură redirecționarea în cazul unei erori 404.
5. **Configurare Heroku** - Fișierul `static.json` definește rutele pentru deployment pe Heroku.

## Caracteristici

- Crearea și gestionarea planurilor de afaceri
- Înregistrarea cheltuielilor și veniturilor
- Calcularea profitului și a altor indicatori financiari
- Interfață intuitivă în limba română
- Autentificare securizată pentru administratori
- Design responsive pentru dispozitive mobile și desktop

## Tehnologii utilizate

- **Frontend**: React.js, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express
- **Routing**: wouter
- **State Management**: React Query, Context API
- **Validare date**: Zod
- **Stocare date**: In-memory (pregătit pentru migrare la PostgreSQL)
- **Deployment**: Vercel

## Instalare și rulare

### Cerințe prealabile

- Node.js (v18 sau mai recent)
- npm (v7 sau mai recent)

### Pași pentru instalare

1. Clonează repository-ul:
   ```
   git clone https://github.com/username/blitz-business.git
   cd blitz-business
   ```

2. Instalează dependențele:
   ```
   npm install
   ```

3. Pornește serverul de dezvoltare:
   ```
   npm run dev
   ```

4. Accesează aplicația la adresa [http://localhost:5000](http://localhost:5000)

## Build și deployment

Pentru a crea versiunea de producție:

```
npm run build
```

Pentru a rula versiunea de producție:

```
npm start
```

## Configurare pentru deployment

### Deployment pe Vercel (Recomandat)

1. Creează un cont și conectează repository-ul GitHub la Vercel
2. Configurează proiectul cu următoarele setări:
   - Framework Preset: Other
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
3. Vercel va detecta automat configurația din `vercel.json`
4. Problemele de rutare SPA (pentru rutele directe) sunt rezolvate de configurația din `vercel.json`

### Deployment pe Netlify (Alternativ)

1. Creează un cont și conectează repository-ul GitHub la Netlify
2. Configurează proiectul cu următoarele setări:
   - Build Command: `npm run build`
   - Publish Directory: `dist/public`
3. Adaugă o regulă de redirectare la setări:
   - Folosește fișierul `_redirects` din `client/public` care conține: `/* /index.html 200`
   
### Deployment pe Heroku (Alternativ)

1. Creează un cont și conectează repository-ul GitHub la Heroku
2. Configurează proiectul cu următoarele setări:
   - Buildpack: heroku/nodejs
   - Config Vars: NODE_ENV=production
3. Fișierul `static.json` va gestiona configurația pentru servirea aplicației SPA

## Licență

Acest proiect este licențiat sub [MIT License](LICENSE).