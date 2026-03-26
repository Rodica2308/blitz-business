import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

type PasswordProtectedRouteProps = {
  children: ReactNode;
};

export function PasswordProtectedRoute({ children }: PasswordProtectedRouteProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [, navigate] = useLocation();
  
  useEffect(() => {
    // Verificăm dacă există token-ul salvat în localStorage
    const checkAuth = () => {
      const auth = localStorage.getItem("isAuthenticated");
      setIsAuthenticated(auth === "true");
      setIsLoading(false);
      
      if (auth !== "true") {
        navigate("/auth");
      }
    };
    
    checkAuth();
  }, [navigate]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return isAuthenticated ? <>{children}</> : null;
}