import { useState, useCallback } from 'react';

interface GeolocationPosition {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  timestamp: number;
}

interface GeolocationError {
  code: number;
  message: string;
}

export function useGeolocation() {
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState<GeolocationError | null>(null);
  const [loading, setLoading] = useState(false);

  const getPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setError({
        code: 0,
        message: 'La geolocalizzazione non è supportata dal tuo browser'
      });
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPosition({
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          },
          timestamp: position.timestamp
        });
        setLoading(false);
      },
      (error) => {
        setError({
          code: error.code,
          message: getErrorMessage(error.code)
        });
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }, []);

  const getErrorMessage = (code: number): string => {
    switch (code) {
      case 1:
        return 'Accesso alla posizione negato. Verifica le impostazioni del browser.';
      case 2:
        return 'Posizione non disponibile. Assicurati di avere una connessione attiva.';
      case 3:
        return 'Timeout scaduto. Riprova.';
      default:
        return 'Errore sconosciuto durante la geolocalizzazione.';
    }
  };

  return { position, error, loading, getPosition };
}
