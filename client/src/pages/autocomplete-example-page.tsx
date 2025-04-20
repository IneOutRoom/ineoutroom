import React, { useState } from 'react';
import { AddressAutocompleteInput } from '@/components/maps/AddressAutocompleteInput';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { AlertCircle, Info, MapPin, Search } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function AutocompleteExamplePage() {
  const [address, setAddress] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<{
    address: string;
    lat: number;
    lng: number;
  } | null>(null);
  
  const handleSearch = () => {
    if (!selectedLocation) {
      toast({
        title: "Posizione non selezionata",
        description: "Seleziona prima una posizione dai suggerimenti",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Ricerca avviata",
      description: `Cercando proprietà vicino a ${selectedLocation.address}`,
    });
    
    // Qui si inserirebbe la chiamata all'API o la navigazione alla pagina di ricerca
    console.log('Ricerca con posizione:', selectedLocation);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2 text-primary">Demo Autocompletamento Indirizzi</h1>
        <p className="text-lg text-center text-muted-foreground mb-8">
          Prova la nuova funzionalità di autocompletamento intelligente con feedback visivo
        </p>
        
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <Info className="h-5 w-5 text-blue-600" />
          <AlertTitle className="text-blue-800">Come usare questa demo</AlertTitle>
          <AlertDescription className="text-blue-700">
            Inizia a digitare un indirizzo (es. "Milano", "Roma", "Napoli") e seleziona
            uno dei suggerimenti che appaiono. Osserva i vari feedback visivi durante l'interazione.
          </AlertDescription>
        </Alert>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="mr-2 h-5 w-5 text-primary" />
              Ricerca proprietà per posizione
            </CardTitle>
            <CardDescription>
              Inserisci un indirizzo per trovare alloggi nelle vicinanze
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              <AddressAutocompleteInput
                value={address}
                onChange={setAddress}
                onSelect={(location) => {
                  console.log('Location selected:', location);
                  setSelectedLocation(location);
                }}
                label="Dove vuoi cercare?"
                placeholder="Inserisci città, indirizzo o zona (es. Milano)"
                helpText="Digita almeno 2 caratteri per vedere i suggerimenti"
              />
              
              {selectedLocation && (
                <div className="p-3 rounded-md bg-green-50 border border-green-100">
                  <h3 className="font-medium text-green-800 mb-1">Dettagli posizione selezionata:</h3>
                  <p className="text-sm text-green-700">
                    <strong>Indirizzo:</strong> {selectedLocation.address}
                  </p>
                  <p className="text-sm text-green-700">
                    <strong>Coordinate:</strong> {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => {
              setAddress('');
              setSelectedLocation(null);
            }}>
              Cancella
            </Button>
            <Button 
              onClick={handleSearch} 
              disabled={!selectedLocation}
              className="gap-2"
            >
              <Search className="h-4 w-4" />
              Cerca Proprietà
            </Button>
          </CardFooter>
        </Card>
        
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-3">Funzionalità implementate:</h2>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li>Autocompletamento in tempo reale con debounce (350ms)</li>
            <li>Feedback visivi durante la digitazione (spinner animato)</li>
            <li>Badge verde dopo la selezione di una località</li>
            <li>Toast di notifica quando si seleziona una posizione</li>
            <li>Messaggi di errore in caso di problemi</li>
            <li>Gestione del tasto Invio per auto-selezionare il primo risultato</li>
            <li>Responsive design adattato a tutti i dispositivi</li>
          </ul>
        </div>
      </div>
    </div>
  );
}