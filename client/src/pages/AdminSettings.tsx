import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { LogoHeader } from "@/components/LogoHeader";

// Schema pentru validarea schimbării parolei
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Parola curentă este necesară"),
  newPassword: z.string().min(4, "Parola nouă trebuie să aibă cel puțin 4 caractere"),
  confirmPassword: z.string().min(1, "Confirmarea parolei este necesară"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Parolele nu coincid",
  path: ["confirmPassword"],
});

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export default function AdminSettings() {
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  
  // Inițializarea react-hook-form
  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  // Mutație pentru schimbarea parolei
  const mutation = useMutation({
    mutationFn: async (data: ChangePasswordFormValues) => {
      return await apiRequest<{ message: string }>({ 
        url: "/api/change-password", 
        method: "POST", 
        data: { 
          currentPassword: data.currentPassword, 
          newPassword: data.newPassword 
        } 
      });
    },
    onSuccess: () => {
      toast({
        title: "Succes",
        description: "Parola a fost schimbată cu succes",
      });
      setIsSuccess(true);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Eroare",
        description: "Parola curentă este incorectă sau a apărut o eroare",
        variant: "destructive",
      });
    },
  });
  
  function onSubmit(data: ChangePasswordFormValues) {
    setIsSuccess(false);
    mutation.mutate(data);
  }
  
  return (
    <div className="container mx-auto p-4 max-w-lg">
      <div className="flex justify-center mb-6">
        <LogoHeader />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Setări administrator</CardTitle>
          <CardDescription>
            Schimbă parola de acces a aplicației
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parola curentă</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Introduceți parola curentă" 
                        {...field} 
                        disabled={mutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parola nouă</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Introduceți parola nouă" 
                        {...field} 
                        disabled={mutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmă parola nouă</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Reintroduceți parola nouă" 
                        {...field} 
                        disabled={mutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {isSuccess && (
                <div className="text-green-600 text-sm font-medium">
                  Parola a fost schimbată cu succes!
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Se procesează..." : "Schimbă parola"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}