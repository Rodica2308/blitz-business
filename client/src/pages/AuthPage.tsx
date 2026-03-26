import { useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { LogoHeader } from "@/components/LogoHeader";

const loginSchema = z.object({
  username: z.string().min(1, { message: "Numele de utilizator este obligatoriu" }),
  password: z.string().min(1, { message: "Parola este obligatorie" })
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AuthPage() {
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // Verificăm dacă utilizatorul este deja autentificat
  const { data: sessionData, isLoading: isSessionLoading } = useQuery({
    queryKey: ["/api/auth/session"],
    queryFn: async () => {
      const res = await apiRequest({ url: "/api/auth/session", method: "GET" });
      return res.json();
    }
  });
  
  // Dacă utilizatorul este deja autentificat, îl redirecționăm către pagina principală
  if (sessionData?.authenticated && !isSessionLoading) {
    navigate("/");
    return null;
  }
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  });
  
  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormValues) => {
      const res = await apiRequest({
        url: "/api/auth/login",
        method: "POST",
        data
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Eroare la autentificare");
      }
      
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Autentificare reușită",
        description: "Bine ați venit!",
      });
      
      navigate("/");
    },
    onError: (error: Error) => {
      setError(error.message);
    }
  });
  
  function onSubmit(data: LoginFormValues) {
    setError(null);
    loginMutation.mutate(data);
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <div className="container mx-auto p-4 flex-1 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
        <div className="flex-1 max-w-md mx-auto md:mx-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">Autentificare</CardTitle>
              <CardDescription className="text-center">
                Introduceți numele de utilizator și parola pentru a accesa platforma educațională
              </CardDescription>
              <div className="mx-auto my-4">
                <LogoHeader />
              </div>
            </CardHeader>
            
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nume utilizator</FormLabel>
                        <FormControl>
                          <Input placeholder="Introduceți numele de utilizator" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parolă</FormLabel>
                        <FormControl>
                          <Input placeholder="Introduceți parola" type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Se procesează..." : "Autentificare"}
                  </Button>
                </form>
              </Form>
            </CardContent>
            
            <CardFooter className="flex justify-center">
              <p className="text-sm text-muted-foreground">
                Blitz Business
              </p>
            </CardFooter>
          </Card>
        </div>
        
        <div className="flex-1 max-w-lg mx-auto md:mx-0">
          <div className="rounded-lg border p-6 shadow-md bg-background">
            <h2 className="text-2xl font-bold mb-4">Blitz Business</h2>
            <p className="mb-3">
              Bine ați venit la platforma educațională de dezvoltare a planurilor de afaceri! 
              Această aplicație este un instrument dedicat elevilor care doresc să își dezvolte 
              abilitățile antreprenoriale.
            </p>
            <h3 className="text-xl font-bold mb-2">Cu această platformă puteți:</h3>
            <ul className="list-disc pl-5 space-y-1 mb-4">
              <li>Crea planuri de afaceri detaliate</li>
              <li>Gestiona bugetele pentru afacerile voastre</li>
              <li>Calcula cheltuieli și venituri</li>
              <li>Analiza profitabilitatea</li>
              <li>Învăța concepte economice importante</li>
            </ul>
            <p className="font-medium">
              Accesul este restricționat pentru a proteja datele și pentru a asigura un mediu educațional sigur.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}