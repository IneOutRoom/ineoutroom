import { useState, useCallback, useEffect } from 'react';
import { apiRequest } from '../lib/queryClient';

interface City {
  id: number;
  name: string;
  country: string;
  region?: string;
  description?: string;
}

// Definiamo un tipo semplificato per le predizioni di autocompletamento
interface AutocompletePrediction {
  place_id: string;
  description: string;
}

export interface AutocompleteOptions {
  country?: string;
  componentRestrictions?: { country: string };
}

export function useAutocomplete(options: AutocompleteOptions = {}) {
  const { country: selectedCountry } = options;
  const [inputValue, setInputValue] = useState('');
  const [predictions, setPredictions] = useState<AutocompletePrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  
  // Carica le città dal database quando cambia il paese selezionato
  useEffect(() => {
    async function fetchCities() {
      try {
        // Costruisce l'URL in base al paese selezionato
        const url = selectedCountry 
          ? `/api/cities?country=${selectedCountry}` 
          : '/api/cities';
        
        const response = await apiRequest('GET', url);
        const data = await response.json();
        setCities(data);
      } catch (error) {
        console.error('Errore nel caricamento delle città:', error);
      }
    }

    fetchCities();
  }, [selectedCountry]);

  const getPredictions = useCallback((input: string) => {
    setLoading(true);
    setInputValue(input);
    
    if (input.length > 0) {
      // Filtra le città in base all'input e al paese selezionato (se presente)
      const filteredCities = cities.filter(city => {
        const matchesInput = city.name.toLowerCase().includes(input.toLowerCase());
        const matchesCountry = !selectedCountry || city.country === selectedCountry;
        return matchesInput && matchesCountry;
      });
      
      // Converte i risultati nel formato richiesto
      const predictions = filteredCities.map(city => {
        // Nomi dei paesi in italiano
        const countryNames: {[key: string]: string} = {
          'IT': 'Italia',
          'ES': 'Spagna',
          'FR': 'Francia',
          'DE': 'Germania',
          'UK': 'Regno Unito',
          'AT': 'Austria',
          'BE': 'Belgio',
          'BG': 'Bulgaria',
          'CY': 'Cipro',
          'HR': 'Croazia',
          'DK': 'Danimarca',
          'EE': 'Estonia',
          'FI': 'Finlandia',
          'GR': 'Grecia',
          'IE': 'Irlanda',
          'LV': 'Lettonia',
          'LT': 'Lituania',
          'LU': 'Lussemburgo',
          'MT': 'Malta',
          'NL': 'Paesi Bassi',
          'PL': 'Polonia',
          'PT': 'Portogallo',
          'CZ': 'Repubblica Ceca',
          'RO': 'Romania',
          'SK': 'Slovacchia',
          'SI': 'Slovenia',
          'SE': 'Svezia',
          'HU': 'Ungheria',
          'AL': 'Albania',
          'AD': 'Andorra',
          'BY': 'Bielorussia',
          'BA': 'Bosnia ed Erzegovina',
          'VA': 'Città del Vaticano',
          'IS': 'Islanda',
          'LI': 'Liechtenstein',
          'MK': 'Macedonia del Nord',
          'MD': 'Moldova',
          'MC': 'Monaco',
          'ME': 'Montenegro',
          'NO': 'Norvegia',
          'RS': 'Serbia',
          'CH': 'Svizzera',
          'UA': 'Ucraina'
        };
        
        // Ottiene il nome del paese o usa il codice come fallback
        const countryName = countryNames[city.country] || city.country;
        
        return {
          place_id: `${city.country.toLowerCase()}-${city.name.toLowerCase().replace(/\s+/g, '-')}`,
          description: `${city.name}, ${countryName}`
        };
      });
      
      setPredictions(predictions);
    } else {
      setPredictions([]);
    }
    
    setLoading(false);
  }, [cities, selectedCountry]);

  const selectPrediction = useCallback((prediction: AutocompletePrediction) => {
    const cityName = prediction.description.split(',')[0].trim();
    setInputValue(cityName);
    setPredictions([]);
  }, []);

  const clearInput = useCallback(() => {
    setInputValue('');
    setPredictions([]);
  }, []);

  return {
    inputValue,
    setInputValue,
    predictions,
    loading,
    getPredictions,
    selectPrediction,
    clearInput
  };
}