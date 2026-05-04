import { Switch, Route, Router } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { Suspense, lazy } from "react";
import NotFound from "@/pages/not-found";
import { PasswordProtectedRoute } from "@/components/PasswordProtectedRoute";

// Lazy loading al paginilor
const Home = lazy(() => import("./pages/Home"));
const BusinessList = lazy(() => import("./pages/BusinessList"));
const BusinessDetail = lazy(() => import("./pages/BusinessDetail"));
const CreateBusiness = lazy(() => import("./pages/CreateBusiness"));
const PasswordAuth = lazy(() => import("./pages/PasswordAuth"));
const AdminSettings = lazy(() => import("./pages/AdminSettings"));

function AppRouter() {
  return (
    <Router base="/blitz-business">
      <Suspense fallback={
        <div className="flex h-screen w-full items-center justify-center">
          <div className="animate-spin text-primary h-12 w-12 border-4 border-t-transparent rounded-full"></div>
        </div>
      }>
        <Switch>
          {/* Rută de autentificare - accesibilă tuturor */}
          <Route path="/auth" component={PasswordAuth} />
          
          {/* Rute protejate - necesită autentificare */}
          <Route path="/">
            <PasswordProtectedRoute>
              <Home />
            </PasswordProtectedRoute>
          </Route>
          
          <Route path="/businesses">
            <PasswordProtectedRoute>
              <BusinessList />
            </PasswordProtectedRoute>
          </Route>
          
          <Route path="/businesses/create">
            <PasswordProtectedRoute>
              <CreateBusiness />
            </PasswordProtectedRoute>
          </Route>
          
          <Route path="/businesses/:id">
            {(params) => (
              <PasswordProtectedRoute>
                <BusinessDetail />
              </PasswordProtectedRoute>
            )}
          </Route>
          
          <Route path="/admin/settings">
            <PasswordProtectedRoute>
              <AdminSettings />
            </PasswordProtectedRoute>
          </Route>
          
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </Router>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
