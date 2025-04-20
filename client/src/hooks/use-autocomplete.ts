import { useState, useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

type AutocompleteOptions = {
  types?: string[];
  componentRestrictions?: { country: string | string[] };
  country?: string; // Per retrocompatibilità
};

// Tipo aggiornato per AutocompleteSuggestion (Google Maps API 2025)
// Usiamo un'interfaccia compatibile che estende AutocompletePrediction
interface AutocompleteSuggestion extends google.maps.places.AutocompletePrediction {
  // Nuovi campi per compatibilità 2025
  mainText: string;
  secondaryText?: string;
  fullText: string;
  contextualText?: Array<{
    text: string;
    key: string;
  }>;
}

export function useAutocomplete(options?: AutocompleteOptions) {
  const [predictions, setPredictions] = useState<AutocompleteSuggestion[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiLoaded, setApiLoaded] = useState(false);
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);

  // Inizializza l'API di Google Maps
  useEffect(() => {
    const loadGoogleMapsApi = async () => {
      try {
        // Verifica se l'API è già caricata
        if (window.google && window.google.maps && window.google.maps.places && window.google.maps.places.AutocompleteService) {
          setApiLoaded(true);
          return;
        }

        // Carica l'API utilizzando il loader
        const loader = new Loader({
          apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
          version: "weekly", // Usiamo la versione stabile più recente
          libraries: ["places"]
        });

        await loader.load();
        setApiLoaded(true);
      } catch (error) {
        console.error("Errore nel caricamento dell'API Google Maps:", error);
      }
    };

    loadGoogleMapsApi();
  }, []);

  // Inizializza il servizio di autocompletamento dopo che l'API è caricata
  useEffect(() => {
    if (apiLoaded && !autocompleteServiceRef.current && window.google && window.google.maps && window.google.maps.places) {
      autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
    }
  }, [apiLoaded]);

  // Funzione per ottenere predizioni di autocompletamento
  const getPredictions = (input: string) => {
    setInputValue(input);
    
    if (!input || input.length < 3 || !autocompleteServiceRef.current) {
      setPredictions([]);
      return;
    }

    setLoading(true);

    const defaultOptions: AutocompleteOptions = {
      types: ['(cities)'],
      componentRestrictions: { country: ['it', 'es'] } // Italia e Spagna
    };

    // Gestione del parametro 'country' per retrocompatibilità
    let mergedOptions = { ...defaultOptions };
    
    if (options) {
      // Se è presente la proprietà country in options, convertila in componentRestrictions
      if (options.country && !options.componentRestrictions) {
        mergedOptions.componentRestrictions = { 
          country: options.country 
        };
        // Crea una copia senza la proprietà country
        const { country, ...rest } = options;
        mergedOptions = { ...mergedOptions, ...rest };
      } else {
        mergedOptions = { ...mergedOptions, ...options };
      }
    }

    // Utilizziamo getPlacePredictions ma adattiamo i risultati al nuovo formato AutocompleteSuggestion
    autocompleteServiceRef.current.getPlacePredictions(
      {
        input,
        ...mergedOptions
      },
      (results, status) => {
        setLoading(false);
        
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          // Convertiamo i risultati nel nuovo formato AutocompleteSuggestion
          const enhancedResults = results.map(prediction => {
            // Estrai il testo principale (di solito il nome della città)
            const mainText = prediction.structured_formatting?.main_text || prediction.description.split(',')[0];
            
            // Estrai il testo secondario (di solito regione/paese)
            const secondaryText = prediction.structured_formatting?.secondary_text || 
                                prediction.description.split(',').slice(1).join(',').trim();
            
            return {
              ...prediction,
              // Aggiungi i nuovi campi per compatibilità 2025
              mainText,
              secondaryText,
              fullText: prediction.description,
              contextualText: prediction.terms?.map(term => ({
                text: term.value,
                key: `term_${term.offset}`
              }))
            } as AutocompleteSuggestion;
          });
          
          setPredictions(enhancedResults);
        } else {
          setPredictions([]);
        }
      }
    );
  };

  // Funzione per selezionare una predizione
  const selectPrediction = (prediction: AutocompleteSuggestion) => {
    // Con la nuova API usiamo fullText invece di description
    setInputValue(prediction.fullText);
    setPredictions([]);
  };

  // Funzione per cancellare l'input
  const clearInput = () => {
    setInputValue('');
    setPredictions([]);
  };

  return {
    inputValue,
    predictions,
    loading,
    getPredictions,
    selectPrediction,
    clearInput,
  };
}
