import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Loader2, MapPin, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Interfaccia per le coordinate geografiche
export interface Coordinates {
  lat: number;
  lng: number;
}

// Interfaccia per il risultato dell'autocompletamento
export interface AddressResult {
  address: string;
  placeId: string;
  coordinates: Coordinates;
  city?: string;
  country?: string;
  postalCode?: string;
  zone?: string;
}

// Props per il componente AddressAutocompleteInput
interface AddressAutocompleteInputProps {
  onAddressSelect?: (result: AddressResult) => void;
  initialValue?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  allowClear?: boolean;
  autoFocus?: boolean;
  countryRestrictions?: string[];
  locationBias?: google.maps.LatLngBounds | google.maps.Circle;
  onInputChange?: (value: string) => void;
  // Proprietà per compatibilità con versioni precedenti
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelect?: (location: any) => void;
  label?: string;
  helpText?: string;
  hasError?: boolean; // Rinominato da error a hasError per evitare conflitti con lo stato locale
  clearable?: boolean;
}

/**
 * AddressAutocompleteInput - Componente per l'autocompletamento degli indirizzi
 * 
 * Utilizza l'API Places di Google Maps per fornire suggerimenti di indirizzi
 * durante la digitazione, con supporto per feedback visivo e selezione.
 */
export function AddressAutocompleteInput({
  onAddressSelect,
  initialValue = '',
  placeholder = 'Cerca indirizzo...',
  className = '',
  disabled = false,
  required = false,
  allowClear = true,
  autoFocus = false,
  countryRestrictions = [],
  locationBias,
  onInputChange,
  // Supporto per props di retrocompatibilità
  value,
  onChange,
  onSelect,
  hasError, // Rinominato per coerenza
  clearable,
  helpText,
  label
}: AddressAutocompleteInputProps) {
  // Stati per gestire l'input e il caricamento
  const [inputValue, setInputValue] = useState(value || initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddressSelected, setIsAddressSelected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Supporto per le props di retrocompatibilità
  useEffect(() => {
    if (value !== undefined) {
      setInputValue(value);
    }
  }, [value]);
  
  // Riferimento all'input DOM
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Riferimento all'autocomplete di Google
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  
  // Toast per notifiche
  const { toast } = useToast();
  
  // Inizializza l'autocomplete quando il componente viene montato
  useEffect(() => {
    // Funzione sicura per verificare se Google Maps è caricato
    const isGoogleMapsLoaded = () => {
      return typeof window !== 'undefined' && 
             window.google && 
             window.google.maps && 
             window.google.maps.places && 
             typeof window.google.maps.places.Autocomplete === 'function';
    };
    
    // Se Google Maps non è disponibile, verifica nuovamente dopo un breve intervallo
    if (!isGoogleMapsLoaded()) {
      console.warn('Google Maps non è stato caricato, assicurati di usare GoogleMapsProvider');
      
      // La mappa potrebbe essere ancora in fase di caricamento, riprova dopo un breve intervallo
      const checkInterval = setInterval(() => {
        if (isGoogleMapsLoaded()) {
          clearInterval(checkInterval);
          initializeAutocomplete();
        }
      }, 500); // Verifica ogni 500ms
      
      // Pulisci l'intervallo quando il componente viene smontato
      return () => clearInterval(checkInterval);
    } else {
      initializeAutocomplete();
    }
    
    // Funzione per inizializzare l'autocomplete
    function initializeAutocomplete() {
      if (!inputRef.current || !isGoogleMapsLoaded()) return;
      
      try {
        // Opzioni per l'autocomplete
        const options: google.maps.places.AutocompleteOptions = {
          fields: ['address_components', 'formatted_address', 'geometry', 'place_id'],
          types: ['address']
        };
        
        // Aggiunge restrizioni per paese se specificate
        if (countryRestrictions && countryRestrictions.length > 0) {
          options.componentRestrictions = { country: countryRestrictions };
        }
        
        // Aggiunge bias di posizione se specificato
        if (locationBias && window.google.maps.LatLngBounds) {
          if (locationBias instanceof window.google.maps.LatLngBounds) {
            options.bounds = locationBias;
          }
          
          // Nota: l'opzione circle è stata rimossa dall'interfaccia ufficiale
          // ma può essere aggiunta come estensione personalizzata
        }
        
        // Crea l'autocomplete
        autocompleteRef.current = new window.google.maps.places.Autocomplete(
          inputRef.current,
          options
        );
      } catch (error) {
        console.error('Errore durante l\'inizializzazione dell\'autocomplete:', error);
        setError('Impossibile inizializzare l\'autocomplete. Riprova più tardi.');
      }
      
      // Aggiungi listener solo se autocompleteRef.current è stato inizializzato
      if (autocompleteRef.current) {
        // Evento di selezione di un luogo
        autocompleteRef.current.addListener('place_changed', () => {
          if (!autocompleteRef.current) return;
          
          setIsLoading(true);
          
          // Ottiene i dettagli del luogo selezionato
          const place = autocompleteRef.current.getPlace();
          
          if (!place.geometry || !place.geometry.location) {
            toast({
              title: "Errore di localizzazione",
              description: "Non è stato possibile determinare la posizione dell'indirizzo selezionato",
              variant: "destructive"
            });
            setIsLoading(false);
            return;
          }
          
          // Estrae le coordinate
          const coordinates: Coordinates = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          };
          
          // Estrae i componenti dell'indirizzo
          const addressComponents = place.address_components || [];
          
          let city: string | undefined;
          let country: string | undefined;
          let postalCode: string | undefined;
          let zone: string | undefined;
          
          // Mappa i componenti dell'indirizzo
          addressComponents.forEach(component => {
            const types = component.types;
            
            if (types.includes('locality')) {
              city = component.long_name;
            } else if (types.includes('country')) {
              country = component.long_name;
            } else if (types.includes('postal_code')) {
              postalCode = component.long_name;
            } else if (types.includes('sublocality') || types.includes('neighborhood')) {
              zone = component.long_name;
            }
          });
          
          // Crea l'oggetto risultato
          const result: AddressResult = {
            address: place.formatted_address || inputValue,
            placeId: place.place_id || '',
            coordinates,
            city,
            country,
            postalCode,
            zone
          };
          
          // Notifica di selezione completata
          toast({
            title: "Indirizzo selezionato",
            description: `${result.address}`,
          });
          
          // Imposta l'input e notifica il genitore
          setInputValue(result.address);
          setIsAddressSelected(true);
          setIsLoading(false);
          
          if (onAddressSelect) {
            onAddressSelect(result);
          }
        });
      }
      
    }
    
    // Pulizia all'unmount
    return () => {
      if (autocompleteRef.current && window.google && window.google.maps && window.google.maps.event) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [toast, countryRestrictions, onAddressSelect]);
  
  // Gestisce il cambio dell'input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setIsAddressSelected(false);
    
    if (onInputChange) {
      onInputChange(value);
    }
  };
  
  // Pulisci l'input se richiesto
  const handleClearInput = () => {
    setInputValue('');
    setIsAddressSelected(false);
    
    if (onInputChange) {
      onInputChange('');
    }
    
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  return (
    <div className={cn("relative", className)}>
      <div className="relative flex items-center">
        {/* Icona mappa */}
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
          <MapPin className="h-4 w-4" />
        </div>
        
        {/* Input */}
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          disabled={disabled}
          required={required}
          autoFocus={autoFocus}
          className={cn(
            "pl-9 pr-12 py-2",
            isAddressSelected ? "border-success text-success" : ""
          )}
        />
        
        {/* Icona di stato */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center">
          {isLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
          
          {isAddressSelected && !isLoading && (
            <CheckCircle className="h-4 w-4 text-success" />
          )}
          
          {allowClear && inputValue && !isLoading && (
            <button
              type="button"
              onClick={handleClearInput}
              className="ml-1 text-muted-foreground hover:text-foreground"
              aria-label="Cancella input"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>
      </div>
      
      {/* Badge di stato */}
      {isAddressSelected && (
        <Badge variant="outline" className="mt-2 bg-success/10 text-success border-success/20">
          <CheckCircle className="h-3 w-3 mr-1" />
          Indirizzo confermato
        </Badge>
      )}
      
      {/* Messaggio di errore */}
      {error && (
        <div className="mt-2 text-sm text-destructive">
          <span className="flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            {error}
          </span>
        </div>
      )}
    </div>
  );
}