import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Settings } from "lucide-react";

const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, { message: "Parola actuală este obligatorie" }),
  newPassword: z.string().min(4, { message: "Noua parolă trebuie să aibă minim 4 caractere" }),
  confirmPassword: z.string().min(4, { message: "Confirmarea parolei este obligatorie" })
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Parolele nu coincid",
  path: ["confirmPassword"]
});

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export default function AdminSettings() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: ""
    }
  });
  
  const changePasswordMutation = useMutation({
    mutationFn: async (data: ChangePasswordFormValues) => {
      const res = await apiRequest({
        url: "/api/auth/change-password",
        method: "POST",
        data: {
          oldPassword: data.oldPassword,
          newPassword: data.newPassword
        }
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Eroare la schimbarea parolei");
      }
      
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Parola a fost schimbată cu succes",
        description: "Noua parolă a fost salvată",
      });
      
      // Resetăm formularul și închidem dialogul
      form.reset();
      setOpen(false);
    },
    onError: (error: Error) => {
      setError(error.message);
    }
  });
  
  function onSubmit(data: ChangePasswordFormValues) {
    setError(null);
    changePasswordMutation.mutate(data);
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Settings className="h-4 w-4" />
          <span>Admin</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schimbă parola</DialogTitle>
          <DialogDescription>
            Schimbați parola de acces pentru platformă
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="oldPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parola actuală</FormLabel>
                  <FormControl>
                    <Input placeholder="Introduceți parola actuală" type="password" {...field} />
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
                    <Input placeholder="Introduceți parola nouă" type="password" {...field} />
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
                  <FormLabel>Confirmare parolă nouă</FormLabel>
                  <FormControl>
                    <Input placeholder="Confirmați parola nouă" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => {
                  form.reset();
                  setOpen(false);
                }}
              >
                Anulează
              </Button>
              <Button 
                type="submit" 
                disabled={changePasswordMutation.isPending}
              >
                {changePasswordMutation.isPending ? "Se procesează..." : "Salvează"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}