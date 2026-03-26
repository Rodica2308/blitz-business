import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogoHeader } from "@/components/LogoHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const passwordSchema = z.object({
  password: z.string().min(1, "Parola este necesară"),
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function PasswordAuth() {
  const [error, setError] = useState<string | null>(null);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
    },
  });
  
  const mutation = useMutation({
    mutationFn: async (password: string) => {
      return await apiRequest<{ message: string }>({ 
        url: "/api/verify-password", 
        method: "POST", 
        data: { password } 
      });
    },
    onSuccess: () => {
      localStorage.setItem("isAuthenticated", "true");
      toast({
        title: "Autentificare reușită",
        description: "Bine ați venit în aplicație!",
      });
      navigate("/");
    },
    onError: () => {
      setError("Parolă incorectă. Vă rugăm încercați din nou.");
      toast({
        title: "Autentificare eșuată",
        description: "Parolă incorectă. Vă rugăm încercați din nou.",
        variant: "destructive",
      });
    },
  });
  
  function onSubmit(data: PasswordFormValues) {
    setError(null);
    mutation.mutate(data.password);
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-4">
          <LogoHeader />
        </div>
        
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Acces aplicație</CardTitle>
            <CardDescription className="text-center">
              Introduceți parola pentru a accesa aplicația
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parolă</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Introduceți parola" 
                          {...field}
                          disabled={mutation.isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {error && (
                  <div className="text-red-500 text-sm text-center">{error}</div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? "Verificare..." : "Intră în aplicație"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
          Blitz Business
        </p>
      </div>
    </div>
  );
}