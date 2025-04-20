import React, { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Home, Map, Search, Info, RefreshCw } from 'lucide-react';
import { GoogleMapIntegration } from '@/components/maps/GoogleMapIntegration';
import { LeafletMapIntegration } from '@/components/maps/LeafletMapIntegration';

// Componente principale per la pagina delle mappe
export default function CartographyPage() {
  // Il valore predefinito è ora true perché abbiamo il fallback automatico
  const [useGoogleMaps, setUseGoogleMaps] = useState(true);
  
  // Funzione per passare manualmente da una mappa all'altra
  const toggleMapProvider = () => setUseGoogleMaps(!useGoogleMaps);

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">In&Out Maps</h1>
            <p className="text-muted-foreground">
              Esplora immobili e visualizza la loro posizione su mappa
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Home size={18} />
                <span className="hidden sm:inline">Home</span>
              </Button>
            </Link>
            <Link href="/search">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Search size={18} />
                <span className="hidden sm:inline">Cerca Immobili</span>
              </Button>
            </Link>
            <Button
              onClick={toggleMapProvider}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 ml-2"
            >
              <RefreshCw size={18} />
              <span className="hidden sm:inline">
                {useGoogleMaps ? "Usa OpenStreetMap" : "Usa Google Maps"}
              </span>
            </Button>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-5 rounded-lg mb-6 border border-primary/20 shadow-sm">
          <div className="flex items-start gap-3">
            <Info className="text-primary h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="text-sm font-medium text-primary-foreground">Come utilizzare In&Out Maps</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Inserisci l'indirizzo di un immobile nella barra di ricerca per visualizzarlo sulla mappa
                e utilizzare Street View per esplorare il quartiere. Puoi confrontare diverse zone e visualizzare la vista stradale degli immobili prima di visitarli.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary-foreground">
                  Ricerca avanzata
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary-foreground">
                  Street View
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary-foreground">
                  Esplorazione quartieri
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <main>
        {useGoogleMaps ? (
          <GoogleMapIntegration 
            googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string} 
          />
        ) : (
          <LeafletMapIntegration />
        )}
      </main>
      
      <footer className="mt-10 text-center">
        <p className="text-sm text-muted-foreground">
          {useGoogleMaps 
            ? "Questa integrazione utilizza le API di Google Maps per fornire mappe e visualizzazioni Street View accurate." 
            : "Questa integrazione utilizza OpenStreetMap per fornire mappe e funzionalità di geolocalizzazione."}
        </p>
        {useGoogleMaps && (
          <p className="text-xs text-gray-400 mt-1">
            Se riscontri problemi con Google Maps, prova a passare a OpenStreetMap tramite il pulsante in alto.
          </p>
        )}
      </footer>
    </div>
  );
}