import React, { useEffect, useState, KeyboardEvent } from 'react';
import { Input } from "@/components/ui/input";
import { AddressAutocompleteInput } from './AddressAutocompleteInput';
import { useToast } from '@/hooks/use-toast';

interface OpenStreetMapAutocompleteProps {
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
  disabled?: boolean;
}

/**
 * Componente di autocompletamento avanzato basato su OpenStreetMap.
 * Fornisce feedback visivi all'utente e supporta la selezione tramite invio.
 */
export default function OpenStreetMapAutocomplete({
  placeholder = "Cerca indirizzo...",
  className = "",
  onAddressSelect,
  initialValue = "",
  country,
  disabled = false
}: OpenStreetMapAutocompleteProps) {
  const [value, setValue] = useState(initialValue);
  const { toast } = useToast();

  // Aggiorna il valore quando cambia initialValue
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  // Gestisce la selezione di un indirizzo
  const handleAddressSelect = (location: { address: string; lat: number; lng: number }) => {
    // Prepara un oggetto indirizzo nel formato atteso dal componente parent
    const addressParts = location.address.split(',').map(part => part.trim());
    const city = addressParts.length > 0 ? addressParts[0] : "";
    
    // Crea oggetto risultato
    const result = {
      full: location.address,
      lat: location.lat,
      lng: location.lng,
      city,
      country: addressParts.length > 1 ? addressParts[addressParts.length - 1] : undefined
    };

    // Chiama onAddressSelect callback
    if (onAddressSelect) {
      onAddressSelect(result);
    }
  };

  return (
    <AddressAutocompleteInput
      value={value}
      onChange={setValue}
      onSelect={handleAddressSelect}
      placeholder={disabled ? "Opzione non disponibile" : placeholder}
      className={`${className} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      label="" // Nascondiamo la label perché è già fornita dal componente parent
      helpText=""
      clearable={true}
    />
  );
}