import { useEffect, useState } from 'react';

// Variabile per tenere traccia dello stato di caricamento globale
let isLoading = false;
let isLoaded = false;
const callbacks: (() => void)[] = [];

// Carica l'API di Google Maps dinamicamente
export function loadGoogleMapsApi(apiKey?: string): Promise<void> {
  // Se l'API è già caricata, restituisci una promise risolta immediatamente
  if (isLoaded && window.google && window.google.maps) {
    return Promise.resolve();
  }

  // Se c'è già un caricamento in corso, restituisci una promise che verrà risolta quando il caricamento sarà completato
  if (isLoading) {
    return new Promise<void>((resolve) => {
      callbacks.push(resolve);
    });
  }

  // Imposta lo stato di caricamento come "in corso"
  isLoading = true;

  // Ottieni la chiave API dalla variabile d'ambiente o dalla variabile globale (impostata in index.html)
  const key = apiKey || import.meta.env.VITE_GOOGLE_MAPS_API_KEY || window.GOOGLE_MAPS_API_KEY;
  
  if (!key) {
    console.error('Google Maps API key non trovata. Assicurati di aver impostato VITE_GOOGLE_MAPS_API_KEY');
    return Promise.reject(new Error('Google Maps API key non trovata'));
  }

  return new Promise<void>((resolve, reject) => {
    // Funzione di callback che verrà chiamata quando l'API sarà caricata
    (window as any).initGoogleMaps = () => {
      isLoaded = true;
      isLoading = false;
      
      // Risolvi la promise corrente
      resolve();
      
      // Risolvi tutte le altre promise in attesa
      callbacks.forEach((callback) => callback());
      callbacks.length = 0;
    };

    // Crea l'elemento script e aggiungi gli attributi necessari
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;
    
    // Funzione di gestione degli errori
    script.onerror = () => {
      isLoading = false;
      reject(new Error('Errore durante il caricamento di Google Maps API'));
      
      // Risolvi tutte le altre promise in attesa con un errore
      callbacks.forEach((callback) => callback());
      callbacks.length = 0;
    };

    // Aggiungi lo script al documento
    document.head.appendChild(script);
  });
}

// Hook React per caricare l'API di Google Maps
export function useGoogleMapsApi(apiKey?: string) {
  const [isApiLoaded, setIsApiLoaded] = useState(isLoaded);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (isLoaded) {
      setIsApiLoaded(true);
      return;
    }

    loadGoogleMapsApi(apiKey)
      .then(() => {
        setIsApiLoaded(true);
      })
      .catch((err) => {
        console.error('Errore durante il caricamento di Google Maps API:', err);
        setError(err);
      });
  }, [apiKey]);

  return { isLoaded: isApiLoaded, error };
}

// Aggiungi la dichiarazione globale per TypeScript
declare global {
  interface Window {
    GOOGLE_MAPS_API_KEY?: string;
    google: any;
    initGoogleMaps: () => void;
  }
}