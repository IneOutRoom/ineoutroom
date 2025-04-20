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

// Props per il componente ModernAddressAutocompleteInput
interface ModernAddressAutocompleteInputProps {
  onAddressSelect?: (result: AddressResult) => void;
  initialValue?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  allowClear?: boolean;
  autoFocus?: boolean;
  countryRestrictions?: string[];
  locationBias?: google.maps.LatLngBounds;
  onInputChange?: (value: string) => void;
  // Proprietà per compatibilità con versioni precedenti
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelect?: (location: any) => void;
  label?: string;
  helpText?: string;
  hasError?: boolean;
  clearable?: boolean;
}

/**
 * ModernAddressAutocompleteInput - Componente moderno per l'autocompletamento degli indirizzi
 * 
 * Utilizza l'API PlaceAutocompleteElement di Google Maps (raccomandata dopo Marzo 2025) 
 * per fornire suggerimenti di indirizzi durante la digitazione.
 */
export function ModernAddressAutocompleteInput({
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
  hasError,
  clearable,
  helpText,
  label
}: ModernAddressAutocompleteInputProps) {
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
  
  // Riferimenti al container DOM e all'elemento autocomplete
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteElementRef = useRef<HTMLElement | null>(null);
  
  // Toast per notifiche
  const { toast } = useToast();
  
  // Verifica se Google Maps è caricato
  const isGoogleMapsLoaded = () => {
    return typeof window !== 'undefined' && 
           window.google && 
           window.google.maps && 
           window.google.maps.places && 
           typeof window.google.maps.places.PlaceAutocompleteElement !== 'undefined';
  };
  
  // Inizializza l'autocomplete quando il componente viene montato
  useEffect(() => {
    // Se Google Maps non è disponibile, verifica nuovamente dopo un breve intervallo
    if (!isGoogleMapsLoaded()) {
      console.warn('Google Maps non è stato caricato o PlaceAutocompleteElement non è disponibile');
      
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
    
    // Funzione per inizializzare l'autocomplete moderno
    function initializeAutocomplete() {
      if (!containerRef.current || !isGoogleMapsLoaded()) return;
      
      try {
        // Rimuovi gli elementi autocomplete esistenti se presenti
        if (autocompleteElementRef.current) {
          containerRef.current.removeChild(autocompleteElementRef.current);
        }
        
        // Crea l'elemento autocomplete
        autocompleteElementRef.current = document.createElement('gmp-placeautocomplete');
        autocompleteElementRef.current.setAttribute('input', '#modern-address-input');
        autocompleteElementRef.current.style.display = 'none'; // Nascondiamo l'elemento ma sfruttiamo la funzionalità
        
        // Configura le opzioni
        if (countryRestrictions && countryRestrictions.length > 0) {
          autocompleteElementRef.current.setAttribute('country-restriction', countryRestrictions.join(','));
        }
        
        // Imposta i tipi di risultato
        autocompleteElementRef.current.setAttribute('type', 'address');
        
        // Aggiungi l'elemento al DOM
        containerRef.current.appendChild(autocompleteElementRef.current);
        
        // Aggiungi event listener per la selezione dei luoghi
        autocompleteElementRef.current.addEventListener('gmp-placeautocomplete-place-changed', () => {
          handlePlaceChanged();
        });
      } catch (error) {
        console.error('Errore durante l\'inizializzazione dell\'autocomplete moderno:', error);
        setError('Impossibile inizializzare l\'autocomplete. Riprova più tardi.');
        
        // Fallback: utilizza l'input standard
        toast({
          title: "Avviso",
          description: "Utilizzando la funzionalità di ricerca standard. I risultati potrebbero essere meno precisi.",
          variant: "default"
        });
      }
    }
    
    // Gestisce la selezione di un luogo
    async function handlePlaceChanged() {
      if (!autocompleteElementRef.current) return;
      
      setIsLoading(true);
      
      try {
        // Ottieni il place_id dal componente
        // TypeScript non conosce le API customizzate di gmp-placeautocomplete
        const autocompleteElement = autocompleteElementRef.current as any;
        const placeId = autocompleteElement.getPlace?.()?.place_id;
        
        if (!placeId) {
          setIsLoading(false);
          return;
        }
        
        // Utilizza il PlacesService per ottenere i dettagli completi
        const placesService = new google.maps.places.PlacesService(document.createElement('div'));
        
        placesService.getDetails(
          {
            placeId: placeId,
            fields: ['address_components', 'formatted_address', 'geometry', 'place_id']
          },
          (place, status) => {
            if (status !== google.maps.places.PlacesServiceStatus.OK || !place || !place.geometry) {
              toast({
                title: "Errore di localizzazione",
                description: "Non è stato possibile determinare la posizione dell'indirizzo selezionato",
                variant: "destructive"
              });
              setIsLoading(false);
              return;
            }
            
            // Estrae le coordinate con verifica
            let coordinates: Coordinates = { lat: 0, lng: 0 };
            
            if (place.geometry?.location) {
              coordinates = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
              };
            } else {
              console.warn('Coordinate non disponibili per questo indirizzo');
            }
            
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
            
            if (onAddressSelect) {
              onAddressSelect(result);
            }
            
            setIsLoading(false);
          }
        );
      } catch (error) {
        console.error('Errore durante la selezione dell\'indirizzo:', error);
        setIsLoading(false);
        setError('Si è verificato un errore durante la selezione dell\'indirizzo.');
      }
    }
    
    // Pulizia all'unmount
    return () => {
      if (autocompleteElementRef.current && containerRef.current) {
        try {
          containerRef.current.removeChild(autocompleteElementRef.current);
        } catch (error) {
          // Ignora errori di rimozione
        }
      }
    };
  }, [toast, countryRestrictions, onAddressSelect, inputValue]);
  
  // Gestisce il cambio dell'input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setIsAddressSelected(false);
    
    if (onInputChange) {
      onInputChange(value);
    }
    
    // Compatibilità
    if (onChange) {
      onChange(e);
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
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative flex items-center">
        {/* Icona mappa */}
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
          <MapPin className="h-4 w-4" />
        </div>
        
        {/* Input */}
        <Input
          ref={inputRef}
          id="modern-address-input" // ID richiesto per collegare a PlaceAutocompleteElement
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          disabled={disabled}
          required={required}
          autoFocus={autoFocus}
          className={cn(
            "pl-9 pr-12 py-2",
            isAddressSelected ? "border-success text-success" : "",
            hasError ? "border-destructive" : ""
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
      {(error || hasError) && (
        <div className="mt-2 text-sm text-destructive">
          <span className="flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            {error || helpText || "Errore nel campo indirizzo"}
          </span>
        </div>
      )}
      
      {/* Help text */}
      {helpText && !error && !hasError && (
        <div className="mt-1 text-xs text-muted-foreground">
          {helpText}
        </div>
      )}
    </div>
  );
}