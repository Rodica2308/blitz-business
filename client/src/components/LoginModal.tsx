import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface LoginModalProps {
  onClose: () => void;
}

// Login form schema
const loginSchema = z.object({
  username: z.string().min(1, "Numele de utilizator este obligatoriu"),
  password: z.string().min(1, "Parola este obligatorie"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginModal = ({ onClose }: LoginModalProps) => {
  const { login } = useAuth();
  const { toast } = useToast();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoggingIn(true);

    try {
      await login(data.username, data.password);
      toast({
        title: "Autentificare reușită",
        description: "Sunteți conectat ca administrator.",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Autentificare eșuată",
        description: "Nume de utilizator sau parolă incorecte. Vă rugăm să încercați din nou.",
        variant: "destructive",
      });
    }

    setIsLoggingIn(false);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Autentificare Administrator</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="username">Nume utilizator</Label>
            <Input
              id="username"
              {...form.register("username")}
              placeholder="Introduceți numele de utilizator"
              autoComplete="username"
            />
            {form.formState.errors.username && (
              <p className="text-sm text-red-500">{form.formState.errors.username.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Parolă</Label>
            <Input
              id="password"
              type="password"
              {...form.register("password")}
              placeholder="Introduceți parola"
              autoComplete="current-password"
            />
            {form.formState.errors.password && (
              <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
            )}
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Se conectează...
                </>
              ) : (
                "Conectare"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
