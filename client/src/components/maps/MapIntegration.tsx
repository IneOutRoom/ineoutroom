import React, { useEffect, useState, useCallback } from 'react';
import { useLoadScript } from '@react-google-maps/api';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

// Lista delle librerie necessarie
const libraries = ["places"] as any;

// Componente principale di integrazione mappe
export function MapIntegration() {
  const [apiStatus, setApiStatus] = useState<'loading' | 'error' | 'success'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Carica l'API di Google Maps
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
    libraries,
  });

  useEffect(() => {
    if (loadError) {
      console.error("Errore nel caricamento di Google Maps API:", loadError);
      setApiStatus('error');
      setErrorMessage(loadError.message);
    } else if (isLoaded) {
      setApiStatus('success');
    }
  }, [isLoaded, loadError]);

  // Stato di caricamento
  if (apiStatus === 'loading') {
    return (
      <Card className="w-full max-w-3xl mx-auto my-8">
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">Caricamento delle mappe in corso...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Errore di caricamento
  if (apiStatus === 'error') {
    return (
      <Card className="w-full max-w-3xl mx-auto my-8 border-red-300">
        <CardContent className="p-8">
          <div className="text-center">
            <div className="bg-red-100 text-red-800 p-4 rounded-md mb-4">
              <h3 className="text-lg font-bold">Errore di caricamento mappe</h3>
              {errorMessage && <p className="mt-2">{errorMessage}</p>}
            </div>
            <p className="text-muted-foreground mt-4">
              Si è verificato un errore durante il caricamento delle API di Google Maps. 
              Per favore, verifica la connessione internet e riprova.
            </p>
            <p className="text-xs mt-4 text-muted-foreground">
              Se l'errore persiste, potrebbe esserci un problema con la chiave API o con il tuo account Google Maps.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // API caricata con successo
  return <MapContent />;
}

// Componente con il contenuto delle mappe (visibile solo quando l'API è caricata)
function MapContent() {
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [address, setAddress] = useState<string>("");
  const [currentAddress, setCurrentAddress] = useState<{
    formatted: string;
    lat: number;
    lng: number;
  } | null>(null);

  // Inizializza la mappa quando il componente è montato
  useEffect(() => {
    // Centro di default (Roma)
    const defaultCenter = { lat: 41.9028, lng: 12.4964 };
    
    // Crea l'elemento mappa
    const mapDiv = document.getElementById('google-map-container');
    if (!mapDiv) return;
    
    const map = new google.maps.Map(mapDiv, {
      center: defaultCenter,
      zoom: 12,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true
    });
    
    setMapInstance(map);

    // Crea marker di default
    new google.maps.Marker({
      position: defaultCenter,
      map,
      title: "Roma",
    });

    // Cleanup
    return () => {
      setMapInstance(null);
    };
  }, []);

  // Inizializza autocomplete quando la mappa è pronta
  useEffect(() => {
    if (!mapInstance) return;

    // Seleziona l'input di ricerca
    const inputElement = document.getElementById('address-search') as HTMLInputElement;
    if (!inputElement) return;

    // Crea l'elemento autocomplete
    const autocomplete = new google.maps.places.Autocomplete(inputElement, {
      fields: ['formatted_address', 'geometry', 'name'],
      types: ['address'],
    });

    // Collega l'autocomplete alla mappa
    autocomplete.bindTo('bounds', mapInstance);

    // Gestisci il cambio di luogo
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      
      if (!place.geometry || !place.geometry.location) {
        console.warn("Posizione non trovata per l'indirizzo:", place.name);
        return;
      }
      
      // Centra la mappa sulla posizione selezionata
      mapInstance.setCenter(place.geometry.location);
      mapInstance.setZoom(17);
      
      // Crea un marker
      const marker = new google.maps.Marker({
        position: place.geometry.location,
        map: mapInstance,
        title: place.name || place.formatted_address,
        animation: google.maps.Animation.DROP
      });
      
      // Aggiorna lo stato
      setCurrentAddress({
        formatted: place.formatted_address || place.name || "",
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      });
      
      // Aggiungi un InfoWindow con i dettagli
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="p-2">
            <h3 class="font-bold">${place.name || "Posizione selezionata"}</h3>
            <p>${place.formatted_address || ""}</p>
            <p class="text-xs mt-1">
              Lat: ${place.geometry.location.lat().toFixed(6)}, 
              Lng: ${place.geometry.location.lng().toFixed(6)}
            </p>
          </div>
        `
      });
      
      marker.addListener('click', () => {
        infoWindow.open(mapInstance, marker);
      });
      
      // Apri InfoWindow subito
      infoWindow.open(mapInstance, marker);
    });

    return () => {
      // Pulizia listener
      google.maps.event.clearInstanceListeners(autocomplete);
    };
  }, [mapInstance]);

  // Renderizza StreetView se abbiamo un indirizzo
  const renderStreetView = () => {
    if (!currentAddress) return null;
    
    // Controlla se il div esiste
    const streetViewDiv = document.getElementById('street-view-container');
    if (!streetViewDiv) return null;
    
    // Crea l'oggetto StreetView
    try {
      const panorama = new google.maps.StreetViewPanorama(streetViewDiv, {
        position: { lat: currentAddress.lat, lng: currentAddress.lng },
        pov: { heading: 34, pitch: 10 },
        zoom: 1,
        addressControl: true,
        fullscreenControl: true
      });
      
      // Verifica se la vista è disponibile
      const streetViewService = new google.maps.StreetViewService();
      streetViewService.getPanorama(
        { location: { lat: currentAddress.lat, lng: currentAddress.lng }, radius: 50 },
        (data, status) => {
          if (status !== google.maps.StreetViewStatus.OK) {
            // Street View non disponibile per questa posizione
            streetViewDiv.innerHTML = `
              <div class="bg-amber-50 p-4 rounded-md text-amber-600 h-full flex items-center justify-center">
                <div>
                  <h3 class="font-medium">Street View non disponibile</h3>
                  <p class="text-sm mt-1">Non ci sono immagini Street View per questa posizione.</p>
                </div>
              </div>
            `;
          }
        }
      );
    } catch (error) {
      console.error("Errore in Street View:", error);
      streetViewDiv.innerHTML = `
        <div class="bg-red-50 p-4 rounded-md text-red-500 h-full flex items-center justify-center">
          <div>
            <h3 class="font-medium">Errore in Street View</h3>
            <p class="text-sm mt-1">Si è verificato un errore durante il caricamento di Street View.</p>
          </div>
        </div>
      `;
    }
    
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-white rounded-lg shadow-md">
        <div className="mb-4">
          <label htmlFor="address-search" className="block text-sm font-medium text-gray-700 mb-1">
            Cerca indirizzo
          </label>
          <input
            id="address-search"
            type="text"
            placeholder="Inserisci un indirizzo (es. Via Roma 1, Milano)"
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <p className="mt-1 text-sm text-gray-500">
            Digita un indirizzo e seleziona un risultato dalla lista suggerita
          </p>
        </div>

        {/* Mappa */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
          <div className="h-[400px] rounded-lg overflow-hidden shadow-md">
            <div id="google-map-container" className="h-full w-full"></div>
          </div>
          
          {/* Street View */}
          <div className="h-[400px] rounded-lg overflow-hidden shadow-md">
            <div id="street-view-container" className="h-full w-full flex items-center justify-center bg-gray-100">
              {!currentAddress && (
                <p className="text-gray-500">Seleziona un indirizzo per visualizzare Street View</p>
              )}
            </div>
            {currentAddress && renderStreetView()}
          </div>
        </div>
        
        {/* Informazioni sulla posizione */}
        {currentAddress && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium">Posizione selezionata</h3>
            <p className="mt-1">{currentAddress.formatted}</p>
            <p className="text-xs mt-1 text-gray-500">
              Coordinate: {currentAddress.lat.toFixed(6)}, {currentAddress.lng.toFixed(6)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}