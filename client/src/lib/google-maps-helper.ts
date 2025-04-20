/**
 * Utility per verificare il caricamento di Google Maps API e gestire il suo utilizzo
 */

// Dichiarazione delle interfacce per il tipo window.google
// Nota: questa è una versione semplificata dell'interfaccia, sufficiente per il nostro usage check
interface GoogleMapsWindow {
  VITE_UNRESTRICTED_MAPS_KEY?: string;
}

// Ottiene la chiave API da utilizzare in base all'ambiente
export const getGoogleMapsApiKey = (): string => {
  // In Next.js
  if (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  }
  
  // In Vite
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
    return import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;
  }
  
  // Chiave fallback (utilizzare solo se necessario, preferibile chiave da environment)
  if (typeof window !== 'undefined' && (window as any).VITE_UNRESTRICTED_MAPS_KEY) {
    return (window as any).VITE_UNRESTRICTED_MAPS_KEY;
  }
  
  console.warn('Google Maps API key non trovata. Verifica le variabili d\'ambiente.');
  return '';
};

// Verifica che Google Maps sia caricato
export const isGoogleMapsLoaded = (): boolean => {
  return typeof window !== 'undefined' && 
         typeof (window as any).google !== 'undefined' && 
         typeof (window as any).google.maps !== 'undefined';
};

// Attende il caricamento di Google Maps prima di eseguire una callback
export const waitForGoogleMaps = (callback: () => void, maxAttempts = 20): void => {
  let attempts = 0;
  
  const checkMapsLoaded = () => {
    attempts++;
    
    if (isGoogleMapsLoaded()) {
      callback();
      return;
    }
    
    if (attempts >= maxAttempts) {
      console.error('Google Maps non si è caricato dopo diversi tentativi');
      return;
    }
    
    setTimeout(checkMapsLoaded, 200);
  };
  
  checkMapsLoaded();
};

// Eventi di caricamento
export const onGoogleMapsLoaded = (callback: () => void): void => {
  if (isGoogleMapsLoaded()) {
    callback();
    return;
  }
  
  // In Next.js con next/script
  if (typeof window !== 'undefined') {
    const scriptElement = document.getElementById('google-maps-js');
    if (scriptElement) {
      scriptElement.addEventListener('load', callback);
      return;
    }
  }
  
  // Fallback al polling se lo script non ha un ID o non è stato trovato
  waitForGoogleMaps(callback);
};