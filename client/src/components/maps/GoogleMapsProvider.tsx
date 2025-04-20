import React, { ReactNode, useState, useEffect } from 'react';
import { LoadScript } from '@react-google-maps/api';
import { getGoogleMapsApiKey } from '../../lib/google-maps-helper';

// Definizione delle librerie Google Maps da caricare
type Libraries = ("places" | "drawing" | "geometry" | "visualization")[];

// Librerie da caricare (places è fondamentale per l'autocompletamento)
const libraries: Libraries = ["places"];

// Props per il provider
interface GoogleMapsProviderProps {
  children: ReactNode;
}

/**
 * GoogleMapsProvider - Componente centralizzato per il caricamento di Google Maps API
 * 
 * Questo componente gestisce il caricamento dell'API di Google Maps in modo centralizzato,
 * utilizzando la LoadScript di @react-google-maps/api per garantire che l'API venga caricata
 * solo lato client e una sola volta nell'applicazione.
 * 
 * Gestisce anche il fallback a una chiave API non ristretta se la principale fallisce.
 */
export function GoogleMapsProvider({ children }: GoogleMapsProviderProps) {
  const [apiKey, setApiKey] = useState<string>('');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [retryWithUnrestricted, setRetryWithUnrestricted] = useState(false);

  // Controlla se siamo in ambiente server durante SSR
  if (typeof window === 'undefined') {
    return <>{children}</>;
  }
  
  // Carica la chiave API corretta (da principale o fallback)
  useEffect(() => {
    // Prima prova con la chiave principale
    if (!retryWithUnrestricted) {
      // Utilizziamo il nostro helper che gestisce sia Next.js che Vite
      const primaryKey = getGoogleMapsApiKey();
      if (primaryKey) {
        setApiKey(primaryKey);
        return;
      } else {
        console.warn('Chiave API Google Maps principale mancante. Verificare le variabili d\'ambiente.');
        setRetryWithUnrestricted(true);
      }
    }
    
    // Se la chiave principale fallisce o non è disponibile, prova con la chiave non ristretta
    if (retryWithUnrestricted) {
      // In ambiente Next.js
      const unrestrictedKey = typeof process !== 'undefined' && process.env 
        ? process.env.NEXT_PUBLIC_UNRESTRICTED_MAPS_KEY 
        : (import.meta.env.VITE_UNRESTRICTED_MAPS_KEY as string);
        
      if (unrestrictedKey) {
        console.info('Utilizzando la chiave API Google Maps non ristretta come fallback.');
        setApiKey(unrestrictedKey);
      } else {
        setLoadError('Nessuna chiave API Google Maps disponibile. Configurare le variabili d\'ambiente.');
      }
    }
  }, [retryWithUnrestricted]);
  
  // Gestisce errori di caricamento dell'API
  const handleLoadError = (error: Error) => {
    console.error('Errore nel caricamento delle API Google Maps:', error);
    
    // Se l'errore è RefererNotAllowedMapError, prova con la chiave non ristretta
    if (error.message && error.message.includes('RefererNotAllowed') && !retryWithUnrestricted) {
      console.warn('Errore di restrizione dominio. Tentativo con chiave non ristretta...');
      setRetryWithUnrestricted(true);
    } else {
      setLoadError(error.message);
    }
  };

  // Gestisce il caricamento con successo
  const handleLoad = () => {
    setIsLoaded(true);
    setLoadError(null);
  };
  
  // Se non abbiamo una chiave API o c'è un errore dopo tutti i tentativi
  if ((loadError || !apiKey) && retryWithUnrestricted) {
    return (
      <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-4">
        <h3 className="font-semibold mb-2">Errore di configurazione Google Maps</h3>
        <p>{loadError || 'Chiave API Google Maps mancante o non valida. Verificare la configurazione.'}</p>
        <p className="text-xs mt-2">Il dominio potrebbe non essere autorizzato nella console Google Cloud.</p>
        <div className="mt-4">{children}</div>
      </div>
    );
  }
  
  // Se non abbiamo una chiave, mostra un messaggio di caricamento
  if (!apiKey) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mr-3" />
        <p>Caricamento configurazione Maps...</p>
      </div>
    );
  }
  
  return (
    <LoadScript
      googleMapsApiKey={apiKey}
      libraries={libraries}
      onError={handleLoadError}
      onLoad={handleLoad}
      loadingElement={
        <div className="flex justify-center items-center h-full w-full bg-background/50">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      }
    >
      {children}
    </LoadScript>
  );
}