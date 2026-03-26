import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Info, Lightbulb, FileText, Users, Speech, Presentation, Award } from "lucide-react";

export function PresentationTips() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="my-6">
      <div className="flex justify-center mb-4">
        <Button 
          variant="outline" 
          className="flex items-center gap-2 px-6 py-2 text-base" 
          onClick={() => setIsOpen(!isOpen)}
        >
          <Info className="h-5 w-5" />
          {isOpen ? "Ascunde sfaturile" : "Arată sfaturi pentru prezentare"}
        </Button>
      </div>

      {isOpen && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center gap-2">
              <Presentation className="h-5 w-5 text-indigo-500" />
              Sfaturi pentru prezentarea planului de afaceri
            </CardTitle>
            <CardDescription>
              Recomandări pentru a face o prezentare eficientă a planului tău de afaceri
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-4">
                <AccordionTrigger className="text-base font-medium">
                  <div className="flex items-center gap-2">
                    <Speech className="h-4 w-4 text-purple-500" />
                    Tehnici de prezentare
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Vorbește clar, încet și suficient de tare pentru ca toată lumea să te audă</li>
                    <li>Menține contactul vizual cu audiența</li>
                    <li>Folosește un limbaj simplu, evită termenii tehnici sau explică-i când îi folosești</li>
                    <li>Structurează prezentarea: introducere, detalii, concluzie</li>
                    <li>Limitează-te la 5-7 minute pentru întreaga prezentare</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-base font-medium">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-amber-500" />
                    Introducerea afacerii
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Începe cu un speech concis (30-60 secunde) care explică ideea de bază a afacerii</li>
                    <li>Prezintă numele afacerii și ce oferă (produse sau servicii)</li>
                    <li>Explică ce problemă rezolvă afacerea ta și de ce ai ales această idee</li>
                    <li>Menționează cui se adresează produsele/serviciile tale (grupul țintă)</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="text-base font-medium">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    Prezentarea bugetului
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Explică clar principalele categorii de cheltuieli și de ce sunt necesare</li>
                    <li>Detaliază sursele de venit și cum ai estimat prețurile și cantitățile</li>
                    <li>Menționează profitul estimat și cum planifici să îl reinvestești</li>
                    <li>Fii pregătit să explici orice cifră din bugetul tău</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="text-base font-medium">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-green-500" />
                    Echipa și resursele
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Prezintă membrii echipei și care sunt responsabilitățile fiecăruia</li>
                    <li>Explică ce resurse aveți deja și ce resurse va trebui să obțineți</li>
                    <li>Menționează partenerii potențiali sau furnizorii cu care veți colabora</li>
                    <li>Descrie spațiul în care veți opera (dacă este cazul)</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger className="text-base font-medium">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-red-500" />
                    Finalizarea prezentării
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Rezumă punctele principale ale planului tău de afaceri</li>
                    <li>Subliniază de ce crezi că afacerea ta va avea succes</li>
                    <li>Menționează planurile de viitor și potențialul de dezvoltare</li>
                    <li>Mulțumește pentru atenție și întreabă dacă sunt întrebări</li>
                    <li>Pregătește-te pentru întrebări dificile și răspunde sincer</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      )}
    </div>
  );
}