import { useState, useEffect } from 'react';

export interface LocationResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  name?: string;
  type?: string;
  address?: {
    city?: string;
    town?: string;
    state?: string;
    country?: string;
  };
}

export function useLocationSearch(query: string, debounceMs = 350) {
  const [results, setResults] = useState<LocationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Resetta i risultati se la query è troppo corta
    if (!query || query.length < 2) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    // Imposta un timer per il debounce
    const timerId = setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        // Costruisci l'URL di ricerca con parametri per risultati migliori
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&accept-language=it`;
        
        // Aggiungi header per rispettare i termini di utilizzo di Nominatim
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'In&Out Rooms/1.0 (https://ineoutroom.eu)',
            'Referer': 'https://ineoutroom.eu',
          }
        });

        if (!response.ok) {
          throw new Error(`Errore nella ricerca: ${response.status} ${response.statusText}`);
        }

        const data: LocationResult[] = await response.json();
        setResults(data);
        
      } catch (err) {
        console.error('Errore durante la ricerca:', err);
        setError(err instanceof Error ? err.message : 'Errore durante la ricerca');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    // Pulizia del timer al cambio della query
    return () => clearTimeout(timerId);
  }, [query, debounceMs]);

  // Formatta un risultato per la visualizzazione
  const formatLocation = (result: LocationResult): string => {
    if (!result) return '';
    
    // Estrai il nome della località e il paese
    const nameParts = result.display_name.split(', ');
    const cityOrTown = nameParts[0];
    const country = nameParts[nameParts.length - 1];
    
    // Se sono diversi, mostra entrambi
    return cityOrTown !== country ? `${cityOrTown}, ${country}` : cityOrTown;
  };

  return {
    results,
    loading,
    error,
    formatLocation,
  };
}