import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddressAutocompleteInput, AddressResult } from "./AddressAutocompleteInput";
import { ModernAddressAutocompleteInput } from "./ModernAddressAutocompleteInput";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/**
 * Demo che mostra il confronto tra vecchio e nuovo componente di autocompletamento
 */
export function ModernAddressAutocompleteDemo() {
  const [legacyResult, setLegacyResult] = useState<AddressResult | null>(null);
  const [modernResult, setModernResult] = useState<AddressResult | null>(null);
  
  return (
    <Card className="w-full max-w-4xl mx-auto my-8 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Demo Autocompletamento Indirizzi
        </CardTitle>
        <CardDescription>
          Confronto tra l'API legacy (Autocomplete) e quella moderna (PlaceAutocompleteElement)
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Alert className="mb-4 bg-amber-50 border-amber-200 text-amber-800">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Avviso</AlertTitle>
          <AlertDescription>
            A partire da marzo 2025, Google ha deprecato l'API Autocomplete a favore della nuova PlaceAutocompleteElement.
            Questo demo mostra entrambe per confronto, ma nei nuovi sviluppi si raccomanda l'utilizzo esclusivo della versione moderna.
          </AlertDescription>
        </Alert>
        
        <Tabs defaultValue="modern" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="modern">
              <Badge variant="outline" className="mr-2 bg-green-100 text-green-800 border-green-200">Raccomandato</Badge>
              Versione Moderna
            </TabsTrigger>
            <TabsTrigger value="legacy">
              <Badge variant="outline" className="mr-2 bg-amber-100 text-amber-800 border-amber-200">Deprecato</Badge>
              Versione Legacy
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="modern" className="mt-4 space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">ModernAddressAutocompleteInput</h3>
              <p className="text-sm text-muted-foreground">
                Utilizza l'API PlaceAutocompleteElement rilasciata da Google nel 2024, raccomandata per tutti i nuovi sviluppi.
              </p>
              
              <ModernAddressAutocompleteInput
                placeholder="Cerca un indirizzo (versione moderna)..."
                onAddressSelect={setModernResult}
                countryRestrictions={["it", "fr", "es", "de", "ch", "at"]}
              />
              
              {modernResult && (
                <div className="p-4 mt-4 bg-muted rounded-md">
                  <h4 className="font-medium mb-2 flex items-center">
                    <Info className="h-4 w-4 mr-2" />
                    Risultato selezionato
                  </h4>
                  <pre className="text-xs overflow-auto p-2 bg-card rounded border">
                    {JSON.stringify(modernResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="legacy" className="mt-4 space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">AddressAutocompleteInput (Legacy)</h3>
              <p className="text-sm text-muted-foreground">
                Utilizza l'API Autocomplete deprecata. Continuerà a funzionare ma non riceverà più aggiornamenti significativi.
              </p>
              
              <AddressAutocompleteInput
                placeholder="Cerca un indirizzo (versione legacy)..."
                onAddressSelect={setLegacyResult}
                countryRestrictions={["it", "fr", "es", "de", "ch", "at"]}
              />
              
              {legacyResult && (
                <div className="p-4 mt-4 bg-muted rounded-md">
                  <h4 className="font-medium mb-2 flex items-center">
                    <Info className="h-4 w-4 mr-2" />
                    Risultato selezionato
                  </h4>
                  <pre className="text-xs overflow-auto p-2 bg-card rounded border">
                    {JSON.stringify(legacyResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end mt-6">
          <Button variant="outline" onClick={() => {
            setLegacyResult(null);
            setModernResult(null);
          }}>
            Resetta Demo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}