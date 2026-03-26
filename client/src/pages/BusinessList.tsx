import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Building, ChevronRight } from "lucide-react";
import { Business } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { LogoHeader } from "@/components/LogoHeader";
import { PresentationTips } from "@/components/PresentationTips";

export default function BusinessList() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  
  const { data: businesses, isLoading, error } = useQuery<Business[]>({
    queryKey: ['/api/businesses'],
  });
  
  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Încărcare...</h1>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="bg-muted/40 h-24"></CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/40 h-14"></CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    toast({
      title: "Eroare la încărcarea datelor",
      description: "Nu am putut încărca lista de afaceri",
      variant: "destructive",
    });
  }
  
  return (
    <div className="container py-10">
      <div className="flex flex-col gap-6">
        <LogoHeader />
        <PresentationTips />
        
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            Lista afacerilor
          </h2>
          <Button onClick={() => navigate("/businesses/create")} size="sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            Afacere nouă
          </Button>
        </div>
        
        {businesses?.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-10 text-center">
            <Building className="h-16 w-16 text-muted-foreground/80 mb-4" />
            <CardTitle className="text-xl mb-3">Nicio afacere</CardTitle>
            <CardDescription className="mb-6">
              Nu ai creat încă nicio afacere. Creează prima ta afacere pentru a începe!
            </CardDescription>
            <Button onClick={() => navigate("/businesses/create")}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Afacere nouă
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {businesses?.map((business) => (
              <Link key={business.id} href={`/businesses/${business.id}`}>
                <a className="block h-full">
                  <Card className="hover:border-primary/50 transition-all h-full flex flex-col">
                    <CardHeader>
                      <CardTitle className="line-clamp-1">{business.name}</CardTitle>
                      <CardDescription>
                        de {business.ownerName}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {business.description || "Nicio descriere"}
                      </p>
                      {business.category && (
                        <Badge variant="outline" className="mt-4">
                          {business.category}
                        </Badge>
                      )}
                    </CardContent>
                    <CardFooter className="border-t bg-muted/30 flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Creat la {new Date(business.createdAt).toLocaleDateString("ro-RO")}
                      </span>
                      <ChevronRight className="h-4 w-4 text-primary" />
                    </CardFooter>
                  </Card>
                </a>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}