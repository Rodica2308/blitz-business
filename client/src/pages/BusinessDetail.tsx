import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Business, Expense, Product,
  ExpenseType, ExpenseFormValues, ProductFormValues,
  expenseFormSchema, productFormSchema
} from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger, DialogClose
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormDescription, FormField, FormItem,
  FormLabel, FormMessage
} from "@/components/ui/form";
import {
  Tabs, TabsContent, TabsList, TabsTrigger
} from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { LogoHeader } from "@/components/LogoHeader";
import { PresentationTips } from "@/components/PresentationTips";
import {
  ArrowLeft, Building, Plus, Edit, Trash2, Receipt, CircleDollarSign,
  PieChart, BarChart4, TrendingUp, BadgePlus, Briefcase, AlertTriangle,
  Banknote, RefreshCw, DollarSign, Euro, CheckCircle
} from "lucide-react";

type CurrencyPair = "USD-RON" | "EUR-RON";

// --- CurrencyConverter Component ---
const CurrencyConverter = ({ businessId }: { businessId: number }) => {
  const { toast } = useToast();
  const [amount, setAmount] = useState<number>(1);
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [currencyPair, setCurrencyPair] = useState<CurrencyPair>("EUR-RON");
  const [loading, setLoading] = useState<boolean>(false);
  const exchangeRates = { "USD-RON": 4.45, "EUR-RON": 4.97 };

  const setCapitalMutation = useMutation({
    mutationFn: async (initialCapital: number) => apiRequest({ url: `/api/businesses/${businessId}/update-capital`, method: 'POST', data: { initialCapital } }),
    onSuccess: () => { 
      toast({ title: "Capital inițial setat" }); 
      queryClient.invalidateQueries({ queryKey: [`/api/businesses/${businessId}`] }); 
      queryClient.invalidateQueries({ queryKey: [`/api/businesses/${businessId}/financial-summary`] }); 
    },
    onError: (error) => toast({ title: "Eroare", description: error instanceof Error ? error.message : "Eroare", variant: "destructive" }),
  });

  const handleConvert = () => { setLoading(true); setTimeout(() => { const rate = exchangeRates[currencyPair]; setConvertedAmount(amount * rate); setLoading(false); }, 500); };
  const handleSetCapital = () => { if (convertedAmount === null) return; setCapitalMutation.mutate(convertedAmount); };
  const getCurrencySymbol = (code: string) => { if (code === "USD") return "$"; if (code === "EUR") return "€"; if (code === "RON") return "lei"; return ""; };
  const fromCurrency = currencyPair.split("-")[0]; const toCurrency = currencyPair.split("-")[1];
  const getCurrencyIcon = (code: string) => { if (code === "USD") return <DollarSign className="h-4 w-4" />; if (code === "EUR") return <Euro className="h-4 w-4" />; return null; };

  return (
    <Card className="mt-6"><CardHeader className="pb-2"><CardTitle className="text-lg flex items-center"><Banknote className="h-5 w-5 mr-2 text-muted-foreground" />Convertor valutar capital</CardTitle></CardHeader>
      <CardContent><div className="space-y-4">
        <div><Select value={currencyPair} onValueChange={(value: CurrencyPair) => { setCurrencyPair(value); setConvertedAmount(null); }}>
            <SelectTrigger><SelectValue placeholder="Alege pereche" /></SelectTrigger>
            <SelectContent><SelectItem value="USD-RON">USD → RON</SelectItem><SelectItem value="EUR-RON">EUR → RON</SelectItem></SelectContent>
        </Select></div>
        <div className="flex items-center space-x-3">
            <div className="flex-1"><div className="flex items-center space-x-2">{getCurrencyIcon(fromCurrency)}<Input type="number" value={amount} onChange={(e) => { setAmount(Number(e.target.value) || 0); setConvertedAmount(null); }} placeholder="Sumă" min="0" step="0.01"/></div></div>
            <Button size="icon" variant="outline" onClick={handleConvert} disabled={loading}>{loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}</Button>
            <div className="flex-1"><div className="flex items-center border rounded-md px-3 py-2 bg-muted/50"><span className="text-sm font-medium">{convertedAmount !== null ? `${convertedAmount.toFixed(2)} ${getCurrencySymbol(toCurrency)}` : "---"}</span></div></div>
        </div>
        {convertedAmount !== null && (<>
            <div className="text-xs text-muted-foreground">Curs: 1 {fromCurrency} = {exchangeRates[currencyPair].toFixed(2)} {toCurrency}</div>
            <Button variant="outline" size="sm" className="w-full mt-2" onClick={handleSetCapital} disabled={setCapitalMutation.isPending}>{setCapitalMutation.isPending ? (<><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Se procesează...</>) : (<><Briefcase className="h-4 w-4 mr-2" /> Actualizează capital</>)}</Button>
        </>)}
      </div></CardContent>
    </Card>
  );
};

// --- Helper Functions ---
const getExpenseDefinition = (type: ExpenseType | string): string => { 
  // Cast to ExpenseType if it's a string
  const expenseType = type as ExpenseType;
  return "Cheltuieli pentru " + translateExpenseType(expenseType);
};
const formatCurrency = (amount: number | undefined | null): string => { if (amount === undefined || amount === null) return "0,00 RON"; return new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON', minimumFractionDigits: 2 }).format(amount); };
const translateExpenseType = (type: string): string => { 
  const t: Record<string, string> = { 
    [ExpenseType.RAW_MATERIALS]: "Materii prime", 
    [ExpenseType.MATERIALS]: "Materiale", 
    [ExpenseType.SUPPLIERS]: "Furnizori", 
    [ExpenseType.TRANSPORTATION]: "Transport", 
    [ExpenseType.DISTRIBUTION]: "Desfacere", 
    [ExpenseType.OTHER]: "Altele" 
  }; 
  return t[type] || type; 
};

// --- EditExpenseDialog ---
const EditExpenseDialog = ({ businessId, expense }: { businessId: number, expense: Expense }) => {
  const { toast } = useToast(); const [open, setOpen] = useState(false);
  const form = useForm<ExpenseFormValues>({ resolver: zodResolver(expenseFormSchema), defaultValues: { businessId, type: expense.type as ExpenseType, amount: Number(expense.amount), description: expense.description || "", },});
  const mutation = useMutation({ mutationFn: async (data: ExpenseFormValues) => apiRequest({ url: `/api/expenses/${expense.id}`, method: "PUT", data }), onSuccess: () => { toast({ title: "Cheltuială actualizată" }); queryClient.invalidateQueries({ queryKey: [`/api/businesses/${businessId}/expenses`] }); queryClient.invalidateQueries({ queryKey: [`/api/businesses/${businessId}/financial-summary`] }); setOpen(false); }, onError: (error) => toast({ title: "Eroare", description: error instanceof Error ? error.message : "Eroare", variant: "destructive" }),});
  function onSubmit(data: ExpenseFormValues) { mutation.mutate(data); }
  return ( <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button variant="ghost" size="sm"><Edit className="h-4 w-4 text-blue-500" /></Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Editează cheltuiala</DialogTitle><DialogDescription>Modifică detaliile</DialogDescription></DialogHeader><Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
    <FormField control={form.control} name="type" render={({ field }) => (<FormItem><FormLabel>Tip</FormLabel><Select onValueChange={(val) => field.onChange(val as ExpenseType)} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selectează..."/></SelectTrigger></FormControl><SelectContent><SelectItem value={ExpenseType.RAW_MATERIALS}>Materii prime</SelectItem><SelectItem value={ExpenseType.MATERIALS}>Materiale</SelectItem><SelectItem value={ExpenseType.SUPPLIERS}>Furnizori</SelectItem><SelectItem value={ExpenseType.TRANSPORTATION}>Transport</SelectItem><SelectItem value={ExpenseType.DISTRIBUTION}>Desfacere</SelectItem><SelectItem value={ExpenseType.OTHER}>Altele</SelectItem></SelectContent></Select>{field.value && (<div className="text-xs text-muted-foreground mt-1">{getExpenseDefinition(field.value)}</div>)}<FormMessage /></FormItem>)}/>
    <FormField control={form.control} name="amount" render={({ field }) => (<FormItem><FormLabel>Sumă (RON)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} /></FormControl><FormMessage /></FormItem>)}/>
    <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Descriere</FormLabel><FormControl><Textarea placeholder="Opțional..." {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>)}/>
    <DialogFooter><Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Se salvează..." : "Salvează"}</Button></DialogFooter></form></Form></DialogContent></Dialog>
  );
};

// --- EditProductDialog ---
const EditProductDialog = ({ businessId, product }: { businessId: number, product: Product }) => {
  const { toast } = useToast(); const [open, setOpen] = useState(false);
  const form = useForm<ProductFormValues>({ resolver: zodResolver(productFormSchema), defaultValues: { businessId, name: product.name, description: product.description || "", unitPrice: Number(product.unitPrice), quantity: Number(product.quantity), unit: product.unit || "buc", },});
  const mutation = useMutation({ mutationFn: async (data: ProductFormValues) => apiRequest({ url: `/api/products/${product.id}`, method: "PUT", data }), onSuccess: () => { toast({ title: "Produs actualizat" }); queryClient.invalidateQueries({ queryKey: [`/api/businesses/${businessId}/products`] }); queryClient.invalidateQueries({ queryKey: [`/api/businesses/${businessId}/financial-summary`] }); setOpen(false); }, onError: (error) => toast({ title: "Eroare", description: error instanceof Error ? error.message : "Eroare", variant: "destructive" }),});
  function onSubmit(data: ProductFormValues) { mutation.mutate(data); }
  return (<Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button variant="ghost" size="sm"><Edit className="h-4 w-4 text-blue-500" /></Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Editează produsul</DialogTitle><DialogDescription>Modifică detaliile</DialogDescription></DialogHeader><Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
    <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Nume</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
    <div className="grid grid-cols-2 gap-4">
      <FormField control={form.control} name="unitPrice" render={({ field }) => (<FormItem><FormLabel>Preț (RON)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} /></FormControl><FormMessage /></FormItem>)}/>
      <FormField control={form.control} name="quantity" render={({ field }) => (<FormItem><FormLabel>Cantitate</FormLabel><FormControl><Input type="number" step="1" placeholder="0" {...field} /></FormControl><FormMessage /></FormItem>)}/>
    </div>
    <FormField control={form.control} name="unit" render={({ field }) => (<FormItem><FormLabel>Unitate</FormLabel><FormControl><Input placeholder="Ex: buc, kg" {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>)}/>
    <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Descriere</FormLabel><FormControl><Textarea placeholder="Detalii..." {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>)}/>
    <DialogFooter><Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Se salvează..." : "Salvează"}</Button></DialogFooter></form></Form></DialogContent></Dialog>
  );
};

// --- AddExpenseDialog ---
interface AddExpenseDialogProps { businessId: number; isCapitalSet: boolean; }
function AddExpenseDialog({ businessId, isCapitalSet }: AddExpenseDialogProps) {
  const { toast } = useToast(); const [open, setOpen] = useState(false);
  const form = useForm<ExpenseFormValues>({ resolver: zodResolver(expenseFormSchema), defaultValues: { businessId, type: ExpenseType.RAW_MATERIALS, amount: 0, description: "", },});
  const mutation = useMutation({ mutationFn: async (data: ExpenseFormValues) => apiRequest({ url: `/api/businesses/${businessId}/expenses`, method: "POST", data }), onSuccess: () => { toast({ title: "Cheltuială adăugată" }); queryClient.invalidateQueries({ queryKey: [`/api/businesses/${businessId}/expenses`] }); queryClient.invalidateQueries({ queryKey: [`/api/businesses/${businessId}/financial-summary`] }); form.reset({ businessId, type: ExpenseType.RAW_MATERIALS, amount: 0, description: "", }); setOpen(false); }, onError: (error) => toast({ title: "Eroare", description: error instanceof Error ? error.message : "Eroare", variant: "destructive" }),});
  function onSubmit(data: ExpenseFormValues) { mutation.mutate(data); }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {/* // ! MODIFIED: disabled moved to Button */}
        <Button disabled={!isCapitalSet} >
          <Plus className="mr-2 h-4 w-4" /> Adaugă cheltuială
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]"><DialogHeader><DialogTitle>Adaugă cheltuială</DialogTitle><DialogDescription>Completează detaliile</DialogDescription></DialogHeader><Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
        <FormField control={form.control} name="type" render={({ field }) => (<FormItem><FormLabel>Tip</FormLabel><Select onValueChange={(val) => field.onChange(val as ExpenseType)} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selectează..."/></SelectTrigger></FormControl><SelectContent><SelectItem value={ExpenseType.RAW_MATERIALS}>Materii prime</SelectItem><SelectItem value={ExpenseType.MATERIALS}>Materiale</SelectItem><SelectItem value={ExpenseType.SUPPLIERS}>Furnizori</SelectItem><SelectItem value={ExpenseType.TRANSPORTATION}>Transport</SelectItem><SelectItem value={ExpenseType.DISTRIBUTION}>Desfacere</SelectItem><SelectItem value={ExpenseType.OTHER}>Altele</SelectItem></SelectContent></Select>{field.value && (<div className="text-xs text-muted-foreground mt-1">{getExpenseDefinition(field.value)}</div>)}<FormMessage /></FormItem>)}/>
        <FormField control={form.control} name="amount" render={({ field }) => (<FormItem><FormLabel>Suma (lei)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} /></FormControl><FormMessage /></FormItem>)}/>
        <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Descriere</FormLabel><FormControl><Textarea placeholder="Detalii..." {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>)}/>
        <DialogFooter><Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Se adaugă..." : "Adaugă"}</Button></DialogFooter></form></Form></DialogContent>
    </Dialog>
  );
}

// --- AddProductDialog ---
interface AddProductDialogProps { businessId: number; isCapitalSet: boolean; }
function AddProductDialog({ businessId, isCapitalSet }: AddProductDialogProps) {
  const { toast } = useToast(); const [open, setOpen] = useState(false);
  const form = useForm<ProductFormValues>({ resolver: zodResolver(productFormSchema), defaultValues: { businessId, name: "", description: "", unitPrice: 0, quantity: 0, unit: "buc", },});
  const mutation = useMutation({ mutationFn: async (data: ProductFormValues) => apiRequest({ url: `/api/businesses/${businessId}/products`, method: "POST", data }), onSuccess: () => { toast({ title: "Venit adăugat" }); queryClient.invalidateQueries({ queryKey: [`/api/businesses/${businessId}/products`] }); queryClient.invalidateQueries({ queryKey: [`/api/businesses/${businessId}/financial-summary`] }); form.reset({ businessId, name: "", description: "", unitPrice: 0, quantity: 0, unit: "buc", }); setOpen(false); }, onError: (error) => toast({ title: "Eroare", description: error instanceof Error ? error.message : "Eroare", variant: "destructive" }),});
  function onSubmit(data: ProductFormValues) { mutation.mutate(data); }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
         {/* // ! MODIFIED: disabled moved to Button */}
        <Button disabled={!isCapitalSet}>
          <Plus className="mr-2 h-4 w-4" /> Adaugă venit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]"><DialogHeader><DialogTitle>Adaugă venit</DialogTitle><DialogDescription>Completează detaliile</DialogDescription></DialogHeader><Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
        <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Nume</FormLabel><FormControl><Input placeholder="Nume sursă venit" {...field} /></FormControl><FormMessage /></FormItem>)}/>
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="unitPrice" render={({ field }) => (<FormItem><FormLabel>Preț (lei)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} /></FormControl><FormMessage /></FormItem>)}/>
          <FormField control={form.control} name="quantity" render={({ field }) => (<FormItem><FormLabel>Cantitate</FormLabel><FormControl><Input type="number" step="1" placeholder="0" {...field} /></FormControl><FormMessage /></FormItem>)}/>
        </div>
        <FormField control={form.control} name="unit" render={({ field }) => (<FormItem><FormLabel>Unitate</FormLabel><FormControl><Input placeholder="Ex: buc, kg" {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>)}/>
        <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Descriere</FormLabel><FormControl><Textarea placeholder="Detalii..." {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>)}/>
        <DialogFooter><Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Se adaugă..." : "Adaugă"}</Button></DialogFooter></form></Form></DialogContent>
    </Dialog>
  );
}

// --- BusinessDetail Component (Main) ---
export default function BusinessDetail() {
  const [_, navigate] = useLocation(); const [match, params] = useRoute("/businesses/:id");
  const businessId = params?.id ? parseInt(params.id) : 0; const { toast } = useToast();

  // --- Data Fetching ---
  const { data: business, isLoading: isLoadingBusiness, error: businessError } = useQuery<Business>({ queryKey: [`/api/businesses/${businessId}`], enabled: businessId > 0 });
  const { data: expenses, isLoading: isLoadingExpenses } = useQuery<Expense[]>({ queryKey: [`/api/businesses/${businessId}/expenses`], enabled: businessId > 0 });
  const { data: products, isLoading: isLoadingProducts } = useQuery<Product[]>({ queryKey: [`/api/businesses/${businessId}/products`], enabled: businessId > 0 });
  const { data: financialSummary, isLoading: isLoadingFinancial } = useQuery<{ totalExpenses: number; totalRevenue: number; profit: number; initialCapital?: number; exceedsInitialCapital?: boolean; expensesByType: Record<string, number>; products: { name: string; revenue: number; quantity: number; unitPrice: number; }[]}>({ queryKey: [`/api/businesses/${businessId}/financial-summary`], enabled: businessId > 0 });

  // --- State & Logic ---
  const isCapitalSet = financialSummary?.initialCapital !== undefined && financialSummary?.initialCapital !== null;

  // --- Mutations ---
  const deleteExpenseMutation = useMutation({ mutationFn: async (expenseId: number) => apiRequest({ url: `/api/expenses/${expenseId}`, method: "DELETE" }), onSuccess: () => { toast({ title: "Cheltuială ștearsă" }); queryClient.invalidateQueries({ queryKey: [`/api/businesses/${businessId}/expenses`] }); queryClient.invalidateQueries({ queryKey: [`/api/businesses/${businessId}/financial-summary`] }); }, onError: (error) => toast({ title: "Eroare", description: error instanceof Error ? error.message : "Eroare", variant: "destructive" }),});
  const deleteProductMutation = useMutation({ mutationFn: async (productId: number) => apiRequest({ url: `/api/products/${productId}`, method: "DELETE" }), onSuccess: () => { toast({ title: "Venit șters" }); queryClient.invalidateQueries({ queryKey: [`/api/businesses/${businessId}/products`] }); queryClient.invalidateQueries({ queryKey: [`/api/businesses/${businessId}/financial-summary`] }); }, onError: (error) => toast({ title: "Eroare", description: error instanceof Error ? error.message : "Eroare", variant: "destructive" }),});

  // --- Render Loading/Error States ---
  if (isLoadingBusiness) { return (<div className="container py-10"><div className="h-8 w-48 bg-muted rounded animate-pulse"></div></div>); }
  if (businessError || !business) { return (<div className="container py-10 text-red-600">Eroare la încărcarea afacerii {businessId}</div>); }

  // --- Main Render ---
  return (
    <div className="container mx-auto px-4 py-6 md:py-10 max-w-5xl">
      <LogoHeader />
      <div className="flex flex-col gap-6">
        {/* Header & Back Button */}
        <div className="flex items-center"><Button variant="ghost" size="sm" onClick={() => navigate("/")} className="mr-2"><ArrowLeft className="h-4 w-4 mr-2" /> Înapoi</Button></div>
        <div className="flex flex-col gap-3">
            <h1 className="text-2xl md:text-3xl font-bold text-center">{business.name}</h1>
            <div className="flex flex-wrap items-center justify-center text-muted-foreground text-sm md:text-base">
              <div className="flex items-center">
                <Building className="h-4 w-4 mr-2" />
                <span>Proprietar: {business.ownerName}</span>
              </div>
              {business.category && (<Badge variant="outline" className="ml-2 mt-1 md:mt-0 md:ml-4">{business.category}</Badge>)}
            </div>
            {business.description && (<p className="mt-2 text-muted-foreground text-center">{business.description}</p>)}
        </div>

        {/* Initial Capital Section */}
        <div className="mt-6 mb-6">
            {/* Redesigned Capital Section for Mobile */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                <h2 className="text-xl font-semibold flex items-center mb-4 md:mb-0">
                  <Banknote className="h-5 w-5 mr-2 text-green-600" />
                  Capital Inițial: {isLoadingFinancial ? "..." : formatCurrency(financialSummary?.initialCapital)}
                </h2>
                <div className="flex flex-col items-center">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          className="mb-3 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-700 hover:border-blue-400 flex items-center px-6 py-3 rounded-lg w-full sm:w-auto font-bold cursor-pointer"
                        >
                          <span className="text-blue-700 dark:text-blue-400 mr-2 text-xl animate-pulse">👉</span>
                          START! - Convertor valutar
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Convertor valutar</DialogTitle>
                          <DialogDescription>Convertește și actualizează capitalul</DialogDescription>
                        </DialogHeader>
                        <CurrencyConverter 
                          businessId={businessId} 
                        />
                      </DialogContent>
                    </Dialog>
                </div>
            </div>
            {/* Capital Status Messages */}
            {financialSummary && financialSummary.exceedsInitialCapital === true && isCapitalSet && (<div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md flex items-start mb-4"><AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" /><div><p className="text-sm font-medium text-yellow-800">Atenție: Capital insuficient!</p><p className="text-xs text-yellow-700 mt-1">Cheltuielile ({formatCurrency(financialSummary.totalExpenses)}) depășesc capitalul ({formatCurrency(financialSummary.initialCapital)}).</p></div></div>)}
            {financialSummary && financialSummary.exceedsInitialCapital === false && isCapitalSet && (<div className="bg-green-50 border border-green-200 p-3 rounded-md flex items-start mb-4"><CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" /><div><p className="text-sm font-medium text-green-800">Capital suficient</p><p className="text-xs text-green-700 mt-1">Cheltuielile ({formatCurrency(financialSummary.totalExpenses)}) sunt acoperite de capital ({formatCurrency(financialSummary.initialCapital)}).{financialSummary.initialCapital! - financialSummary.totalExpenses > 0 && (<> Rămân: {formatCurrency(financialSummary.initialCapital! - financialSummary.totalExpenses)}.</>)}</p></div></div>)}
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="expenses">
          <TabsList className="grid w-full grid-cols-2 border rounded-md p-1">
             {/* // ! MODIFIED: Added styling for active/inactive tabs */}
            <TabsTrigger value="expenses" className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=inactive]:bg-muted data-[state=inactive]:text-muted-foreground">
                Cheltuieli
            </TabsTrigger>
            <TabsTrigger value="products" className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=inactive]:bg-muted data-[state=inactive]:text-muted-foreground">
                Venituri estimate
            </TabsTrigger>
          </TabsList>

          {/* Expenses Tab Content */}
          <TabsContent value="expenses" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Gestionare cheltuieli</h2>
               <div className="flex items-center gap-4">
                 <AddExpenseDialog businessId={businessId} isCapitalSet={isCapitalSet} />
                 {/* Warning Message */}
                 {!isCapitalSet && !isLoadingFinancial && ( <p className="text-sm font-medium text-orange-600 flex items-center gap-1"><AlertTriangle className="h-4 w-4" /> Setează capitalul întâi.</p>)}
               </div>
            </div>
            {isLoadingExpenses ? ( <div className="text-center p-4">Se încarcă cheltuielile...</div> )
             : expenses?.length === 0 ? (<Card className="text-center p-6"><CardTitle className="text-lg">Nicio cheltuială</CardTitle><CardDescription>Adaugă prima cheltuială folosind butonul de mai sus.</CardDescription></Card>)
             : (<div className="space-y-4"><Card><CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full">
                <thead><tr className="border-b"><th className="text-left p-4">Tip</th><th className="text-left p-4">Descriere</th><th className="text-right p-4">Sumă</th><th className="text-right p-4">Acțiuni</th></tr></thead>
                <tbody>{expenses?.map((expense) => (<tr key={expense.id} className="border-b">
                  <td className="p-4"><div className="group relative inline-block"><Badge variant="outline">{translateExpenseType(expense.type)}</Badge><div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-64 p-2 bg-white shadow-lg rounded-md border text-xs z-10">{getExpenseDefinition(expense.type)}</div></div></td>
                  <td className="p-4">{expense.description || "-"}</td><td className="p-4 text-right font-medium">{formatCurrency(Number(expense.amount))}</td>
                  <td className="p-4 text-right"><div className="flex justify-end space-x-2"><EditExpenseDialog businessId={businessId} expense={expense} /><Button variant="ghost" size="sm" onClick={() => {if (confirm("Sigur ștergi?")) { deleteExpenseMutation.mutate(expense.id); }}}><Trash2 className="h-4 w-4 text-red-500" /></Button></div></td></tr>))}</tbody></table></div></CardContent></Card>
                {financialSummary?.expensesByType && Object.keys(financialSummary.expensesByType).length > 0 && (<Card><CardHeader><CardTitle className="text-lg">Cheltuieli / categorii</CardTitle></CardHeader><CardContent><div className="space-y-3">
                  {Object.entries(financialSummary.expensesByType).map(([type, amount]) => (<div key={type} className="flex justify-between items-center"><div className="flex items-center"><div className="group relative inline-block mr-2"><Badge variant="outline">{translateExpenseType(type)}</Badge><div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-64 p-2 bg-white shadow-lg rounded-md border text-xs z-10">{getExpenseDefinition(type)}</div></div></div><span className="font-medium">{formatCurrency(amount)}</span></div>))}
                </div></CardContent></Card>)}
              </div>)}
          </TabsContent>

          {/* Products Tab Content */}
          <TabsContent value="products" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Venituri estimate</h2>
              <div className="flex items-center gap-4">
                <AddProductDialog businessId={businessId} isCapitalSet={isCapitalSet} />
                 {/* Warning Message */}
                {!isCapitalSet && !isLoadingFinancial && ( <p className="text-sm font-medium text-orange-600 flex items-center gap-1"><AlertTriangle className="h-4 w-4" /> Setează capitalul întâi.</p>)}
              </div>
            </div>
             {isLoadingProducts ? ( <div className="text-center p-4">Se încarcă veniturile...</div> )
             : products?.length === 0 ? (<Card className="text-center p-6"><CardTitle className="text-lg">Niciun venit</CardTitle><CardDescription>Adaugă primul venit estimat folosind butonul de mai sus.</CardDescription></Card>)
             : (<Card><CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full">
                <thead><tr className="border-b"><th className="text-left p-4">Nume</th><th className="text-left p-4">Descriere</th><th className="text-right p-4">Preț unitar</th><th className="text-right p-4">Cantitate</th><th className="text-right p-4">Total</th><th className="text-right p-4">Acțiuni</th></tr></thead>
                <tbody>{products?.map((product) => (<tr key={product.id} className="border-b">
                  <td className="p-4 font-medium">{product.name}</td><td className="p-4">{product.description || "-"}</td><td className="p-4 text-right">{formatCurrency(Number(product.unitPrice))}{product.unit && ` / ${product.unit}`}</td><td className="p-4 text-right">{product.quantity}</td><td className="p-4 text-right font-medium">{formatCurrency(Number(product.unitPrice) * Number(product.quantity))}</td>
                  <td className="p-4 text-right"><div className="flex justify-end space-x-2"><EditProductDialog businessId={businessId} product={product} /><Button variant="ghost" size="sm" onClick={() => {if (confirm("Sigur ștergi?")) { deleteProductMutation.mutate(product.id); }}}><Trash2 className="h-4 w-4 text-red-500" /></Button></div></td></tr>))}</tbody></table></div></CardContent></Card>)}
          </TabsContent>
        </Tabs>

        {/* Financial Summary Section */}
        <div className="mt-10 mb-6">
          <h2 className="text-xl font-semibold mb-6 text-center">Sumar financiar</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <Card className="border-l-4 border-l-emerald-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-base md:text-lg flex items-center justify-center md:justify-start">
                  <Briefcase className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span>Capital Inițial</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center md:text-left">
                {isLoadingFinancial ? 
                  <div className="h-8 bg-muted rounded animate-pulse"></div> : 
                  <div className="text-xl md:text-2xl font-bold">{formatCurrency(financialSummary?.initialCapital)}</div>
                }
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-orange-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-base md:text-lg flex items-center justify-center md:justify-start">
                  <Receipt className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span>Cheltuieli totale</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center md:text-left">
                {isLoadingFinancial ? 
                  <div className="h-8 bg-muted rounded animate-pulse"></div> : 
                  <> 
                    <div className="text-xl md:text-2xl font-bold">{formatCurrency(financialSummary?.totalExpenses)}</div> 
                    {financialSummary?.exceedsInitialCapital === true && isCapitalSet && (
                      <div className="mt-2 text-xs text-red-600 flex items-center justify-center md:justify-start">
                        <AlertTriangle className="h-3 w-3 mr-1" /> Depășește capitalul!
                      </div>
                    )} 
                  </>
                }
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-base md:text-lg flex items-center justify-center md:justify-start">
                  <TrendingUp className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span>Venituri totale</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center md:text-left">
                {isLoadingFinancial ? 
                  <div className="h-8 bg-muted rounded animate-pulse"></div> : 
                  <div className="text-xl md:text-2xl font-bold">{formatCurrency(financialSummary?.totalRevenue)}</div>
                }
              </CardContent>
            </Card>
            
            <Card className="shadow-lg border-t-4 border-b-4 font-bold">
              <CardHeader className="pb-2 bg-gray-50 dark:bg-gray-800">
                <CardTitle className="text-base md:text-lg flex items-center justify-center md:justify-start">
                  <PieChart className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span>Profit</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center md:text-left">
                {isLoadingFinancial ? 
                  <div className="h-8 bg-muted rounded animate-pulse"></div> : 
                  <div className={`text-xl md:text-2xl font-bold ${financialSummary?.profit === 0 ? 'text-gray-700' : (financialSummary?.profit && financialSummary.profit > 0) ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(financialSummary?.profit)}
                  </div>
                }
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Presentation Tips Section */}
        <div className="mt-10 mb-6">
          <h2 className="text-xl font-semibold mb-6 text-center">Sfaturi prezentare</h2>
          <PresentationTips />
        </div>
      </div>
    </div>
  );
}