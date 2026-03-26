import { ReactNode, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

type ProtectedRouteProps = {
  children: ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [, navigate] = useLocation();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/auth/session"],
    queryFn: async () => {
      const res = await apiRequest({ url: "/api/auth/session", method: "GET" });
      return res.json();
    }
  });
  
  useEffect(() => {
    // Dacă nu este în stare de loading și utilizatorul nu este autentificat, redirecționăm către pagina de autentificare
    if (!isLoading && !data?.authenticated) {
      navigate("/auth");
    }
  }, [data, isLoading, navigate]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-destructive">
          Eroare la verificarea autentificării. Vă rugăm reîncercați.
        </div>
      </div>
    );
  }
  
  // Afișăm conținutul rutei protejate doar dacă utilizatorul este autentificat
  return data?.authenticated ? <>{children}</> : null;
}