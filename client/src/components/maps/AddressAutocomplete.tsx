import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Input } from "@/components/ui/input";

interface AddressAutocompleteProps {
  placeholder?: string;
  className?: string;
  onAddressSelect?: (address: {
    full: string;
    lat: number;
    lng: number;
    country?: string;
    city?: string;
    postalCode?: string;
    street?: string;
    streetNumber?: string;
  }) => void;
  initialValue?: string;
  country?: string; // limitare la ricerca al paese specifico (es. "it" per Italia)
}

// Estende l'interfaccia Window globale
declare global {
  interface Window {
    google: typeof google;
  }
}

export default function AddressAutocomplete({
  placeholder = "Cerca indirizzo...",
  className = "",
  onAddressSelect,
  initialValue = "",
  country
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [value, setValue] = useState(initialValue);
  const [loading, setLoading] = useState(true);
  
  // Carica Google Maps API
  useEffect(() => {
    const loadGoogleMaps = async () => {
      try {
        // Controlla se Google Maps è già caricato
        if (window.google && window.google.maps && window.google.maps.places) {
          setLoading(false);
          return;
        }
        
        const loader = new Loader({
          apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
          version: "weekly",
          libraries: ["places"]
        });
        
        await loader.load();
        setLoading(false);
      } catch (error) {
        console.error("Errore nel caricamento di Google Maps API:", error);
      }
    };
    
    loadGoogleMaps();
  }, []);
  
  // Inizializza l'autocomplete quando l'input è disponibile e l'API è caricata
  useEffect(() => {
    if (!loading && inputRef.current && !autocompleteRef.current && window.google) {
      try {
        const options: google.maps.places.AutocompleteOptions = {
          fields: ["address_components", "formatted_address", "geometry", "name"],
          types: ["address"],
        };
        
        // Aggiungi restrizione per paese se specificato
        if (country) {
          options.componentRestrictions = { country };
        }
        
        autocompleteRef.current = new google.maps.places.Autocomplete(
          inputRef.current,
          options
        );
        
        // Aggiungi event listener per quando l'utente seleziona un indirizzo
        autocompleteRef.current.addListener("place_changed", () => {
          const place = autocompleteRef.current?.getPlace();
          
          if (!place || !place.geometry || !place.geometry.location) {
            console.warn("Indirizzo non valido selezionato");
            return;
          }
          
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          
          // Analizza i componenti dell'indirizzo
          let country = "";
          let city = "";
          let postalCode = "";
          let street = "";
          let streetNumber = "";
          
          if (place.address_components) {
            for (const component of place.address_components) {
              const types = component.types;
              
              if (types.includes("country")) {
                country = component.long_name;
              } else if (types.includes("locality")) {
                city = component.long_name;
              } else if (types.includes("postal_code")) {
                postalCode = component.long_name;
              } else if (types.includes("route")) {
                street = component.long_name;
              } else if (types.includes("street_number")) {
                streetNumber = component.long_name;
              }
            }
          }
          
          // Aggiorna lo stato e chiama la callback
          setValue(place.formatted_address || "");
          
          if (onAddressSelect) {
            onAddressSelect({
              full: place.formatted_address || "",
              lat,
              lng,
              country,
              city,
              postalCode,
              street,
              streetNumber
            });
          }
        });
      } catch (error) {
        console.error("Errore nell'inizializzazione dell'autocomplete:", error);
      }
    }
    
    return () => {
      // Pulizia listener se necessario
      if (window.google && autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [loading, onAddressSelect, country]);
  
  return (
    <Input
      ref={inputRef}
      type="text"
      placeholder={loading ? "Caricamento..." : placeholder}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className={className}
      disabled={loading}
    />
  );
}