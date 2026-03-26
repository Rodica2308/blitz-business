import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function LogoutButton() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      setIsLoggingOut(true);
      const res = await apiRequest({
        url: "/api/auth/logout",
        method: "POST"
      });
      
      if (!res.ok) {
        throw new Error("Eroare la deconectare");
      }
      
      return res.json();
    },
    onSuccess: () => {
      // Invalidăm datele sesiunii și alte date care ar trebui reîncărcate după deconectare
      queryClient.invalidateQueries({ queryKey: ["/api/auth/session"] });
      
      toast({
        title: "Deconectare reușită",
      });
      
      // Redirecționăm către pagina de autentificare
      navigate("/auth");
    },
    onError: (error) => {
      toast({
        title: "Eroare la deconectare",
        description: error instanceof Error ? error.message : "A apărut o eroare",
        variant: "destructive"
      });
    },
    onSettled: () => {
      setIsLoggingOut(false);
    }
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="flex items-center gap-1"
      onClick={handleLogout}
      disabled={isLoggingOut}
    >
      <LogOut className="h-4 w-4" />
      <span>{isLoggingOut ? "Se deconectează..." : "Deconectare"}</span>
    </Button>
  );
}