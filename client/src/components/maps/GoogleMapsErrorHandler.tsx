import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Map, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface GoogleMapsErrorHandlerProps {
  fallbackComponent: React.ReactNode;
  children: React.ReactNode;
}

export function GoogleMapsErrorHandler({ fallbackComponent, children }: GoogleMapsErrorHandlerProps) {
  const [hasGoogleMapsError, setHasGoogleMapsError] = useState(false);
  const [errorType, setErrorType] = useState<'referer' | 'billing' | 'unknown'>('unknown');
  
  useEffect(() => {
    // Verifica se Google Maps è già stato caricato con errori
    if (document.querySelector('script[src*="maps.googleapis.com"][data-error]')) {
      detectErrorType();
      setHasGoogleMapsError(true);
      return;
    }
    
    // Controlla se l'API è stata caricata correttamente
    if (window.google?.maps && typeof window.google.maps.Map === 'function') {
      setHasGoogleMapsError(false);
      return;
    }
    
    // Ascolta gli errori futuri
    const handleGoogleMapsError = () => {
      detectErrorType();
      setHasGoogleMapsError(true);
    };
    
    document.addEventListener('google-maps-error', handleGoogleMapsError);
    
    // Imposta un timeout per verificare se l'API è stata caricata
    const timeout = setTimeout(() => {
      if (!window.google?.maps || !window.google.maps.Map) {
        detectErrorType();
        setHasGoogleMapsError(true);
      }
    }, 5000);
    
    return () => {
      document.removeEventListener('google-maps-error', handleGoogleMapsError);
      clearTimeout(timeout);
    };
  }, []);
  
  // Rileva il tipo di errore dagli elementi della pagina o dalla console
  const detectErrorType = () => {
    // Cerca errori specifici nella console (non sempre disponibili)
    const consoleErrors = (window as any).__console_errors__ || [];
    
    if (consoleErrors.some((e: any) => 
      typeof e === 'string' && (
        e.includes('RefererNotAllowedMapError') || 
        e.includes('site URL to be authorized')
      )
    )) {
      setErrorType('referer');
      return;
    }
    
    if (consoleErrors.some((e: any) => 
      typeof e === 'string' && (
        e.includes('BillingNotEnabledMapError') ||
        e.includes('API project is not authorized')
      )
    )) {
      setErrorType('billing');
      return;
    }
    
    // Controlla anche l'URL della pagina corrente
    const currentUrl = window.location.href;
    console.debug("URL corrente:", currentUrl);
    
    setErrorType('unknown');
  };
  
  if (hasGoogleMapsError) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Errore di caricamento Google Maps</AlertTitle>
          <AlertDescription>
            {errorType === 'referer' && (
              "Il dominio di questo sito non è autorizzato a utilizzare Google Maps API. Contattare l'amministratore."
            )}
            {errorType === 'billing' && (
              "La fatturazione per le API Google Maps non è attiva. Contattare l'amministratore."
            )}
            {errorType === 'unknown' && (
              "Si è verificato un errore nel caricamento di Google Maps. Contattare l'amministratore."
            )}
          </AlertDescription>
        </Alert>
        
        <Card className="overflow-hidden border-dashed border-red-200">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <Map className="h-16 w-16 text-muted-foreground" />
              <div>
                <h3 className="text-lg font-medium">Google Maps non disponibile</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Stiamo visualizzando una mappa alternativa che potrebbe avere funzionalità limitate.
                </p>
              </div>
              
              <div className="w-full">
                {fallbackComponent}
              </div>
              
              {/* Solo per amministratori e sviluppatori */}
              {process.env.NODE_ENV === 'development' && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="mt-4"
                  onClick={() => window.open('https://console.cloud.google.com/apis/credentials', '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Configura API Key
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return <>{children}</>;
}