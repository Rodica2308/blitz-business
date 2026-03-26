import { useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, ChevronRight, LucideIcon, Briefcase, ArrowRight, ArrowLeft, LogOut } from "lucide-react";
import logoPath from "@assets/logo.jpg";

const Home = () => {
  const [_, navigate] = useLocation();
  
  const handleCreateBusiness = () => {
    navigate("/businesses/create");
  };
  
  const handleLogout = () => {
    // Ștergem indicatorul de autentificare din localStorage
    localStorage.removeItem("isAuthenticated");
    // Redirecționăm către pagina de autentificare
    navigate("/auth");
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-gray-100 p-4">
      {/* Buton de logout în colțul din dreapta sus */}
      <div className="fixed top-4 right-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center text-gray-600 hover:text-red-600 border-gray-300"
          onClick={handleLogout}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Deconectare
        </Button>
      </div>
      
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-violet-600 text-transparent bg-clip-text">
          Blitz Business
        </h1>
        <p className="text-gray-600 max-w-md">
          Platformă educațională dezvoltată de prof. SIMINA Marius
        </p>
      </div>
      
      <Card className="w-full max-w-lg shadow-lg border-0">
        <CardContent className="flex flex-col items-center p-8">
          {/* Logo */}
          <div className="w-full mb-8 flex justify-center">
            <div className="flex items-center justify-center p-4 rounded-xl bg-white shadow-lg border border-gray-100">
              <img 
                src={logoPath} 
                alt="Logo" 
                className="w-auto h-40 object-contain"
              />
            </div>
          </div>
          
          {/* Separator */}
          <div className="w-full h-px bg-gray-200 mb-8"></div>
          
          {/* Guide with steps */}
          <div className="w-full">
            <h2 className="text-xl font-bold mb-4 text-center bg-gradient-to-r from-blue-600 to-violet-600 text-transparent bg-clip-text">
              Ghid de utilizare
            </h2>
            
            <div className="space-y-6 mb-8">
              {/* Step 1 */}
              <div className="border rounded-lg p-4 shadow-sm">
                <div className="flex items-center mb-2">
                  <div className="bg-blue-600 text-white rounded-full h-7 w-7 flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="font-bold">1</span>
                  </div>
                  <h3 className="font-semibold text-lg">Creează afacerea</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3 pl-10">
                  Completează datele de bază: nume, proprietar și domeniu de activitate pentru a crea planul tău de afacere.
                </p>
                <div className="pl-10 mt-2">
                  <Link href="/businesses/create">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center text-blue-600 hover:text-blue-700"
                    >
                      <PlusCircle className="h-4 w-4 mr-1" />
                      Începe aici
                    </Button>
                  </Link>
                </div>
              </div>
              
              {/* Step 2 */}
              <div className="relative border rounded-lg p-4 shadow-sm">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-b from-white via-white to-transparent h-6 w-6 flex items-center justify-center">
                    <ArrowRight className="h-5 w-5 text-blue-400 rotate-90" />
                  </div>
                </div>
                <div className="flex items-center mb-2">
                  <div className="bg-blue-600 text-white rounded-full h-7 w-7 flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="font-bold">2</span>
                  </div>
                  <h3 className="font-semibold text-lg">Setarea Capitalului Inițial</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3 pl-10">
                  Folosește convertorul valutar pentru a calcula și seta capitalul inițial în RON pentru afacerea ta.
                </p>
                <div className="pl-10 mt-2">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <span className="text-sm text-blue-600 italic">
                      După crearea afacerii, vei fi direcționat automat la acest pas
                    </span>
                    <Link href="/businesses">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex items-center text-blue-600 hover:text-blue-700 whitespace-nowrap"
                      >
                        Vezi afacerile tale
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
              
              {/* Step 3 */}
              <div className="relative border rounded-lg p-4 shadow-sm">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-b from-white via-white to-transparent h-6 w-6 flex items-center justify-center">
                    <ArrowRight className="h-5 w-5 text-blue-400 rotate-90" />
                  </div>
                </div>
                <div className="flex items-center mb-2">
                  <div className="bg-blue-600 text-white rounded-full h-7 w-7 flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="font-bold">3</span>
                  </div>
                  <h3 className="font-semibold text-lg">Înregistrarea Cheltuielilor</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3 pl-10">
                  Adaugă toate categoriile de cheltuieli pentru afacerea ta: materii prime, materiale, furnizori, transport, etc.
                </p>
                <div className="pl-10 mt-2">
                  <span className="text-sm text-blue-600">
                    Continuă cu acest pas după setarea capitalului inițial
                  </span>
                </div>
              </div>
              
              {/* Step 4 */}
              <div className="relative border rounded-lg p-4 shadow-sm">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-b from-white via-white to-transparent h-6 w-6 flex items-center justify-center">
                    <ArrowRight className="h-5 w-5 text-blue-400 rotate-90" />
                  </div>
                </div>
                <div className="flex items-center mb-2">
                  <div className="bg-blue-600 text-white rounded-full h-7 w-7 flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="font-bold">4</span>
                  </div>
                  <h3 className="font-semibold text-lg">Planificarea Veniturilor</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3 pl-10">
                  Adaugă produsele sau serviciile pe care le vei oferi, cu prețuri și cantități estimate pentru vânzare.
                </p>
                <div className="pl-10 mt-2">
                  <span className="text-sm text-blue-600">
                    Completează acest pas pentru a calcula veniturile estimate
                  </span>
                </div>
              </div>
              
              {/* Step 5 */}
              <div className="relative border rounded-lg p-4 shadow-sm">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-b from-white via-white to-transparent h-6 w-6 flex items-center justify-center">
                    <ArrowRight className="h-5 w-5 text-blue-400 rotate-90" />
                  </div>
                </div>
                <div className="flex items-center mb-2">
                  <div className="bg-blue-600 text-white rounded-full h-7 w-7 flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="font-bold">5</span>
                  </div>
                  <h3 className="font-semibold text-lg">Analiza Rezultatelor</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3 pl-10">
                  Analizează sumarul financiar pentru a vedea profitul estimat și dacă cheltuielile se încadrează în capitalul inițial.
                </p>
                <div className="pl-10 mt-2">
                  <span className="text-sm text-blue-600">
                    Evaluează profitabilitatea afacerii tale pe baza datelor introduse
                  </span>
                </div>
              </div>
              
              {/* Step 6 */}
              <div className="relative border rounded-lg p-4 shadow-sm">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-b from-white via-white to-transparent h-6 w-6 flex items-center justify-center">
                    <ArrowRight className="h-5 w-5 text-blue-400 rotate-90" />
                  </div>
                </div>
                <div className="flex items-center mb-2">
                  <div className="bg-blue-600 text-white rounded-full h-7 w-7 flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="font-bold">6</span>
                  </div>
                  <h3 className="font-semibold text-lg">Prezentarea Afacerii</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3 pl-10">
                  Pregătește-te pentru prezentarea planului tău de afaceri folosind sfaturile disponibile în pagina de detalii.
                </p>
                <div className="pl-10 pb-1">
                  <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
                    <p className="text-xs text-blue-800 font-medium mb-2">Sfaturi pentru prezentare:</p>
                    <ul className="text-xs text-blue-700 list-disc pl-4 space-y-1">
                      <li>Pregătește o introducere concisă a afacerii (30-60 secunde)</li>
                      <li>Explică clar bugetul și sursele de venit</li>
                      <li>Prezintă echipa și resursele necesare</li>
                      <li>Vorbește clar și menține contactul vizual</li>
                      <li>Încheie cu un rezumat și planuri de viitor</li>
                    </ul>
                    <p className="text-xs text-blue-800 mt-2">*Sfaturi complete sunt disponibile în detaliile afacerii</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <p className="mt-6 text-sm text-gray-500">
        © {new Date().getFullYear()} Blitz Business
      </p>
    </div>
  );
};

export default Home;
