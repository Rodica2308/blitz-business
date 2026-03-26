# Blitz Business

Platformă educațională pentru dezvoltarea planurilor de afaceri pentru studenți.

## Arhitectură

- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Express.js (TypeScript)
- **Routing client**: wouter
- **State management**: TanStack React Query v5
- **Stocare**: MemStorage (in-memory)
- **Autentificare**: Parolă simplă verificată server-side (password.json cu scrypt hash)

## Structura proiectului

```
client/src/
  pages/          - Pagini principale (Home, BusinessList, BusinessDetail, CreateBusiness, PasswordAuth, AdminSettings)
  components/     - Componente reutilizabile (Layout, Sidebar, PasswordProtectedRoute, LogoHeader, PresentationTips)
  lib/            - queryClient.ts (apiRequest cu format obiect: { url, method, data })
  hooks/          - use-toast.ts
server/
  index.ts        - Entry point server Express
  routes.ts       - Rute API (businesses, expenses, products, password)
  storage.ts      - MemStorage implementare
  password.ts     - Hash/verificare parole cu scrypt
  vite.ts         - NU SE MODIFICĂ
shared/
  schema.ts       - Drizzle schemas + Zod validări + tipuri TypeScript
```

## API

### Autentificare
- `POST /api/verify-password` - Verifică parola
- `POST /api/change-password` - Schimbă parola

### Afaceri
- `GET /api/businesses` - Lista afacerilor
- `GET /api/businesses/:id` - Detalii afacere
- `POST /api/businesses` - Creează afacere
- `PUT /api/businesses/:id` - Actualizează afacere
- `DELETE /api/businesses/:id` - Șterge afacere
- `POST /api/businesses/:id/update-capital` - Actualizează capital inițial

### Cheltuieli
- `GET /api/businesses/:businessId/expenses` - Lista cheltuieli
- `POST /api/businesses/:businessId/expenses` - Adaugă cheltuială
- `PUT /api/expenses/:id` - Actualizează cheltuială
- `DELETE /api/expenses/:id` - Șterge cheltuială

### Produse/Venituri
- `GET /api/businesses/:businessId/products` - Lista produse
- `POST /api/businesses/:businessId/products` - Adaugă produs
- `PUT /api/products/:id` - Actualizează produs
- `DELETE /api/products/:id` - Șterge produs

### Sumar financiar
- `GET /api/businesses/:businessId/financial-summary` - Calcul automat cheltuieli, venituri, profit

## Note importante

- `apiRequest` folosește format obiect: `apiRequest({ url, method, data })` - returnează JSON parsat, NU obiect Response
- Autentificarea folosește localStorage ("isAuthenticated") prin PasswordProtectedRoute
- Parola implicită este stocată hash-uită în password.json (generată la prima rulare)
- NU modifica: vite.config.ts, server/vite.ts, package.json, drizzle.config.ts
- Tipurile de cheltuieli: materii_prime, materiale, furnizori, transport, desfacere, altele (enum ExpenseType)
