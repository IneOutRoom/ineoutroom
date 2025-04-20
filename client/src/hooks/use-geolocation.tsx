import { useState, useCallback } from 'react';

interface GeolocationPosition {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  timestamp: number;
}

interface GeolocationCoords {
  lat: number;
  lng: number;
}

export function useGeolocation() {
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getPosition = useCallback((): Promise<GeolocationCoords | null> => {
    return new Promise((resolve) => {
      setLoading(true);
      setError(null);

      if (!navigator.geolocation) {
        setError('La geolocalizzazione non è supportata dal tuo browser');
        setLoading(false);
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          
          setPosition({
            coords: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
            },
            timestamp: position.timestamp,
          });
          setLoading(false);
          resolve(coords);
        },
        (error) => {
          let errorMessage = 'Errore sconosciuto nella geolocalizzazione';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Permesso di geolocalizzazione negato';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Informazioni sulla posizione non disponibili';
              break;
            case error.TIMEOUT:
              errorMessage = 'Richiesta della posizione scaduta';
              break;
          }
          
          setError(errorMessage);
          setLoading(false);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    });
  }, []);

  return {
    position,
    error,
    loading,
    getPosition,
  };
}