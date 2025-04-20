import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Map } from '@/components/ui/map';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

// Posizione fissa di Roma per il test
const ROMA_CENTER = { lat: 41.9028, lng: 12.4964 };

// Marker di esempio fissi per evitare problemi di re-rendering
const EXAMPLE_MARKERS = [
  {
    id: 1,
    position: { lat: 41.9028, lng: 12.4964 },
    title: 'Roma',
    info: '<div><strong>Roma</strong><p>La città eterna</p></div>'
  },
  {
    id: 2,
    position: { lat: 41.8902, lng: 12.4923 },
    title: 'Colosseo',
    info: '<div><strong>Colosseo</strong><p>Anfiteatro Flavio</p></div>'
  },
  {
    id: 3,
    position: { lat: 41.9022, lng: 12.4539 },
    title: 'Città del Vaticano',
    info: '<div><strong>Città del Vaticano</strong><p>Stato indipendente</p></div>'
  }
];

export default function MapTestPage() {
  const handleMarkerClick = (markerId: number) => {
    console.log('Marker cliccato:', markerId);
  };
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Test di Google Maps</h1>
      
      <Alert variant="warning" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Attenzione</AlertTitle>
        <AlertDescription>
          Per utilizzare pienamente Google Maps API è necessario abilitare la fatturazione nel progetto Google Cloud associato alla tua chiave API. L'errore "BillingNotEnabledMapError" indica che la fatturazione non è stata abilitata.
        </AlertDescription>
      </Alert>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Mappa di Roma</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[500px]">
            <Map 
              center={ROMA_CENTER}
              zoom={14}
              markers={EXAMPLE_MARKERS}
              onMarkerClick={handleMarkerClick}
              className="w-full h-full rounded-xl"
            />
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informazioni</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">
              Questa pagina mostra l'integrazione con Google Maps. L'API è attualmente in modalità di prova e mostra l'errore "BillingNotEnabledMapError" finché non viene abilitata la fatturazione. 
            </p>
            <p className="text-sm font-semibold">
              Per abilitare la fatturazione:
            </p>
            <ol className="mt-2 text-sm list-decimal pl-5 space-y-1">
              <li>Vai alla console Google Cloud</li>
              <li>Seleziona il tuo progetto</li>
              <li>Vai a "Fatturazione"</li>
              <li>Collega un account di fatturazione al progetto</li>
            </ol>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Funzionalità disponibili</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">
              Il componente Map è configurato per supportare queste funzionalità:
            </p>
            <ul className="mt-2 text-sm list-disc pl-5 space-y-1">
              <li>Visualizzazione della mappa con centro e zoom personalizzabili</li>
              <li>Marker con finestre informative personalizzate</li>
              <li>Gestione eventi click sui marker</li>
              <li>Calcolo distanze tra punti</li>
              <li>Geocoding (conversione indirizzo ↔ coordinate)</li>
              <li>Geolocalizzazione (posizione utente)</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}