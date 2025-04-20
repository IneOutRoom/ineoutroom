import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { PriceSuggestion } from "@/components/pricing/PriceSuggestion";
import { TrendingUp, Home, EuroIcon } from "lucide-react";

export default function PriceSuggestionPage() {
  const [city, setCity] = useState<string>("");
  const [zone, setZone] = useState<string>("");
  const [propertyType, setPropertyType] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2 flex items-center">
        <TrendingUp className="mr-2 h-8 w-8 text-primary" />
        Suggerimento Prezzi
      </h1>
      <p className="text-muted-foreground mb-8">
        Scopri il prezzo di mercato ottimale per il tuo annuncio basato sui dati reali della tua zona
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Dettagli Proprietà</CardTitle>
              <CardDescription>
                Inserisci i dettagli della tua proprietà per ottenere un suggerimento di prezzo preciso
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="city">Città</Label>
                <Input 
                  id="city" 
                  placeholder="Milano"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="zone">Zona/Quartiere</Label>
                <Input 
                  id="zone" 
                  placeholder="Navigli, Isola, ecc."
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="propertyType">Tipo di proprietà</Label>
                <Select 
                  value={propertyType} 
                  onValueChange={setPropertyType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Tipo di proprietà</SelectLabel>
                      <SelectItem value="stanza_singola">Stanza Singola</SelectItem>
                      <SelectItem value="stanza_doppia">Stanza Doppia</SelectItem>
                      <SelectItem value="monolocale">Monolocale</SelectItem>
                      <SelectItem value="bilocale">Bilocale</SelectItem>
                      <SelectItem value="altro">Altro</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="price">Prezzo pensato (€/mese)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">€</span>
                  <Input 
                    id="price" 
                    type="number"
                    className="pl-7"
                    placeholder="500"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-base">Vantaggi del Pricing Intelligente</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <div className="mr-2 h-5 w-5 text-primary">✓</div>
                  <span>Ottimizza i ricavi per il tuo immobile</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 h-5 w-5 text-primary">✓</div>
                  <span>Riduci i tempi di vacancy dell'immobile</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 h-5 w-5 text-primary">✓</div>
                  <span>Basato su analisi di mercato in tempo reale</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 h-5 w-5 text-primary">✓</div>
                  <span>Considera oltre 20 fattori di mercato</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Analisi del Prezzo</CardTitle>
              <CardDescription>
                Suggerimento basato sui dati reali del mercato nella tua zona
              </CardDescription>
            </CardHeader>
            <CardContent>
              {price && (
                <div className="mb-6 p-3 bg-muted rounded-md">
                  <h3 className="text-sm font-medium mb-2 flex items-center">
                    <Home className="h-4 w-4 mr-1" /> Il tuo prezzo
                  </h3>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold">€{price}</span>
                    <span className="text-sm text-muted-foreground ml-2">al mese</span>
                  </div>
                </div>
              )}
              
              <PriceSuggestion 
                city={city} 
                zone={zone || null} 
                propertyType={propertyType || null} 
                onSuggestedPriceSelect={(suggestedPrice) => setPrice(suggestedPrice.toString())}
              />
              
              <div className="mt-6 text-sm text-muted-foreground">
                <p>
                  I suggerimenti di prezzo si basano su dati di mercato reali degli ultimi 60 giorni
                  e sono aggiornati quotidianamente. La precisione aumenta quando fornisci più dettagli.
                </p>
              </div>
            </CardContent>
          </Card>
          
          {price && city && (
            <Card className="mt-4 border-primary/20">
              <CardContent className="pt-6">
                <h3 className="font-medium mb-3 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                  Crei più valore con la tua proprietà
                </h3>
                <p className="text-sm mb-4">
                  Per massimizzare i guadagni, considera questi servizi premium che aumentano il valore percepito:
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 border rounded-md hover:border-primary hover:bg-primary/5 transition-colors">
                    <h4 className="font-medium text-sm">Foto professionali</h4>
                    <p className="text-xs text-muted-foreground">+15% di click sul tuo annuncio</p>
                  </div>
                  <div className="p-3 border rounded-md hover:border-primary hover:bg-primary/5 transition-colors">
                    <h4 className="font-medium text-sm">Virtual tour</h4>
                    <p className="text-xs text-muted-foreground">+30% di contatti qualificati</p>
                  </div>
                  <div className="p-3 border rounded-md hover:border-primary hover:bg-primary/5 transition-colors">
                    <h4 className="font-medium text-sm">Pulizia professionale</h4>
                    <p className="text-xs text-muted-foreground">+5% sul prezzo finale</p>
                  </div>
                  <div className="p-3 border rounded-md hover:border-primary hover:bg-primary/5 transition-colors">
                    <h4 className="font-medium text-sm">Arredamento moderno</h4>
                    <p className="text-xs text-muted-foreground">+10-20% sul prezzo finale</p>
                  </div>
                </div>
                
                <Button className="w-full mt-4">
                  Crea il tuo annuncio
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}