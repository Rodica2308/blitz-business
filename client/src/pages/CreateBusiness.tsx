import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Business, BusinessFormValues, businessFormSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft, Save } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { LogoHeader } from "@/components/LogoHeader";

export default function CreateBusiness() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  
  const form = useForm<BusinessFormValues>({
    resolver: zodResolver(businessFormSchema),
    defaultValues: {
      name: "",
      ownerName: "",
      description: "",
      category: ""
    }
  });
  
  const mutation = useMutation({
    mutationFn: async (data: BusinessFormValues) => {
      return apiRequest({
        url: "/api/businesses",
        method: "POST",
        data
      });
    },
    onSuccess: (data: Business) => {
      queryClient.invalidateQueries({ queryKey: ['/api/businesses'] });
      toast({
        title: "Afacere creată cu succes",
        description: `Afacerea ${data.name} a fost creată`,
      });
      navigate(`/businesses/${data.id}`);
    },
    onError: (error) => {
      toast({
        title: "Eroare la crearea afacerii",
        description: error instanceof Error ? error.message : "Încercați din nou",
        variant: "destructive",
      });
    }
  });
  
  function onSubmit(data: BusinessFormValues) {
    mutation.mutate(data);
  }
  
  return (
    <div className="container py-10">
      <div className="flex flex-col gap-6 max-w-2xl mx-auto">
        <LogoHeader />
        
        <div className="flex items-center mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate("/")}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Înapoi
          </Button>
          <h1 className="text-3xl font-bold">Crează o afacere nouă</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Detalii afacere</CardTitle>
            <CardDescription>
              Completează informațiile de bază despre afacerea ta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Denumirea afacerii</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Patiseria Ana" {...field} />
                      </FormControl>
                      <FormDescription>
                        Denumirea oficială a afacerii tale
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="ownerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Numele proprietarului</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Ana Popescu" {...field} />
                      </FormControl>
                      <FormDescription>
                        Numele persoanei care deține afacerea
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Domeniul de activitate al afacerii</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Alimentație, IT, Servicii, etc." {...field} value={field.value || ""} />
                      </FormControl>
                      <FormDescription>
                        Domeniul în care activează afacerea ta
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descriere</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descrie afacerea ta în câteva cuvinte..."
                          className="min-h-[120px]"
                          {...field}
                          value={field.value || ""} 
                        />
                      </FormControl>
                      <FormDescription>
                        Oferă o scurtă descriere a afacerii tale
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={mutation.isPending}
                    className="w-full sm:w-auto"
                  >
                    {mutation.isPending ? (
                      <>Se creează...</>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Creează afacerea
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}