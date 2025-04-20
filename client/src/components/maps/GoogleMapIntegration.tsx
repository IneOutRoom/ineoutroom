import React, { useEffect, useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Loader2, MapPin, Map, MapIcon, Lightbulb, AlertTriangle } from 'lucide-react';
import { Loader } from '@googlemaps/js-api-loader';
import { GoogleMapsErrorHandler } from './GoogleMapsErrorHandler';
import { LeafletMapIntegration } from './LeafletMapIntegration';
import { AddressAutocompleteInput } from './AddressAutocompleteInput';

type Props = {
  googleMapsApiKey: string;
};

// Estensione dell'interfaccia Window per aggiungere l'oggetto google
declare global {
  interface Window {
    google: any; // Usiamo 'any' invece di 'typeof google' per evitare errori circolari di tipizzazione
    __console_errors__?: string[]; // Array per raccogliere gli errori di console
  }
}

export function GoogleMapIntegration({ googleMapsApiKey }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [address, setAddress] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<{
    address: string;
    lat: number;
    lng: number;
  } | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const streetViewContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const panoramaRef = useRef<google.maps.StreetViewPanorama | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  // Carica l'API di Google Maps usando @googlemaps/js-api-loader
  useEffect(() => {
    // Log per debug
    console.debug("Caricamento Google Maps in corso...");
    console.debug("URL corrente:", window.location.href);
    
    // Se già caricato, non ricaricare
    if (window.google && window.google.maps) {
      console.debug("Google Maps già caricato");
      setLoading(false);
      setMapLoaded(true);
      return;
    }

    // Loader ufficiale di Google Maps
    const loadGoogleMaps = async () => {
      try {
        const loader = new Loader({
          apiKey: googleMapsApiKey,
          version: "weekly",
          libraries: ["places"],
          authReferrerPolicy: "origin"
        });
        
        await loader.load();
        console.debug("Google Maps caricato con successo");
        setLoading(false);
        setMapLoaded(true);
      } catch (err) {
        console.error("Errore durante il caricamento di Google Maps:", err);
        setLoading(false);
        setError(`Errore nel caricamento di Google Maps: ${err instanceof Error ? err.message : 'Errore sconosciuto'}`);
      }
    };

    loadGoogleMaps();
  }, [googleMapsApiKey]);

  // Inizializza la mappa quando lo script è caricato
  useEffect(() => {
    if (!mapLoaded || !mapContainerRef.current) return;

    try {
      // Crea la mappa
      const mapOptions: google.maps.MapOptions = {
        center: { lat: 41.9028, lng: 12.4964 }, // Roma come centro predefinito
        zoom: 8,
        mapTypeControl: true,
        fullscreenControl: true,
        streetViewControl: true
      };

      const map = new google.maps.Map(mapContainerRef.current, mapOptions);
      mapInstanceRef.current = map;

      // Aggiungi un marker iniziale per Roma
      const initialMarker = new google.maps.Marker({
        position: { lat: 41.9028, lng: 12.4964 },
        map,
        title: 'Roma',
        animation: google.maps.Animation.DROP
      });
      markersRef.current.push(initialMarker);

      // Inizializza StreetView
      if (streetViewContainerRef.current) {
        const panorama = new google.maps.StreetViewPanorama(streetViewContainerRef.current, {
          position: { lat: 41.9028, lng: 12.4964 },
          pov: { heading: 34, pitch: 10 },
          zoom: 1,
          visible: false
        });
        map.setStreetView(panorama);
        panoramaRef.current = panorama;
      }

      // Inizializza l'autocomplete
      if (searchInputRef.current) {
        const autocomplete = new google.maps.places.Autocomplete(searchInputRef.current, {
          fields: ['formatted_address', 'geometry', 'name'],
          types: ['address']
        });

        autocomplete.bindTo('bounds', map);

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (!place.geometry || !place.geometry.location) {
            console.warn("Luogo non trovato");
            // Mostriamo un messaggio di errore all'utente
            setAddress("Indirizzo non trovato");
            return;
          }

          // Pulisci i marker esistenti
          markersRef.current.forEach(marker => marker.setMap(null));
          markersRef.current = [];

          // Aggiorna la mappa
          const position = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          };

          map.setCenter(position);
          map.setZoom(15);

          // Crea un nuovo marker
          const marker = new google.maps.Marker({
            position,
            map,
            title: place.name || place.formatted_address || "",
            animation: google.maps.Animation.DROP
          });
          markersRef.current.push(marker);

          // Aggiorna StreetView
          if (panoramaRef.current) {
            panoramaRef.current.setPosition(position);
            panoramaRef.current.setVisible(true);
          }

          // Ottieni l'indirizzo formattato
          const formattedAddress = place.formatted_address || place.name || "Posizione selezionata";
          
          // Aggiorna lo stato dell'indirizzo e dell'input
          setAddress(formattedAddress);
          
          // Aggiorna lo stato della posizione selezionata
          setSelectedLocation({
            address: formattedAddress,
            lat: position.lat,
            lng: position.lng
          });
        });
      }

      // Aggiungi listener per click sulla mappa
      map.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return;
        
        // Salva latLng in una variabile per evitare controlli null ripetuti
        const latLng = e.latLng;

        // Pulisci i marker esistenti
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];

        // Crea un nuovo marker
        const marker = new google.maps.Marker({
          position: latLng,
          map,
          animation: google.maps.Animation.DROP
        });
        markersRef.current.push(marker);

        // Aggiorna StreetView
        if (panoramaRef.current) {
          panoramaRef.current.setPosition(latLng);
          panoramaRef.current.setVisible(true);
        }
        
        // Estrai le coordinate
        const lat = latLng.lat();
        const lng = latLng.lng();

        // Geocode inverso per ottenere l'indirizzo
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: latLng }, (results, status) => {
          if (status === "OK" && results && results[0]) {
            const formattedAddress = results[0].formatted_address;
            
            // Aggiorna lo stato dell'indirizzo nell'input
            setAddress(formattedAddress);
            
            // Per sicurezza aggiorniamo anche il valore diretto dell'input
            if (searchInputRef.current) {
              searchInputRef.current.value = formattedAddress;
            }

            // Aggiorna lo stato della posizione selezionata
            setSelectedLocation({
              address: formattedAddress,
              lat,
              lng
            });
          } else {
            console.warn("Geocode inverso fallito:", status);
            
            // Mostra messaggio di errore nell'input
            const errorMessage = "⚠️ Impossibile trovare la posizione selezionata. Prova con un'altra città.";
            setAddress(errorMessage);
            
            // Aggiorna comunque lo stato con le coordinate
            setSelectedLocation({
              address: `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`,
              lat,
              lng
            });
          }
        });
      });

    } catch (e) {
      console.error("Errore durante l'inizializzazione della mappa:", e);
      setError(`Errore durante l'inizializzazione della mappa: ${e instanceof Error ? e.message : 'Errore sconosciuto'}`);
    }
  }, [mapLoaded]);

  // Mostra lo stato di caricamento
  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-lg text-muted-foreground">Caricamento mappa...</span>
      </div>
    );
  }

  // Mostra errori se presenti con informazioni dettagliate
  if (error) {
    return (
      <Card className="p-8 overflow-hidden">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-red-600 mb-2">Errore di caricamento</h3>
          <p className="text-red-500">{error}</p>
          <p className="mt-4 text-sm text-gray-600">
            Per favore, verifica la connessione internet e riprova.
            Se il problema persiste, contatta l'amministratore del sito.
          </p>
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md text-left">
            <h4 className="font-medium text-yellow-700 mb-2">Possibili cause dell'errore:</h4>
            <ul className="list-disc pl-5 text-sm text-yellow-600 space-y-1">
              <li>La chiave API di Google Maps potrebbe non essere valida</li>
              <li>La fatturazione potrebbe non essere abilitata sulla console Google Cloud</li>
              <li>L'URL di questo sito potrebbe non essere autorizzato nelle restrizioni dell'API</li>
              <li>Le API necessarie (Maps, Places, StreetView) potrebbero non essere abilitate</li>
            </ul>
            <p className="mt-3 text-xs text-yellow-700">
              Per risolvere questi problemi, assicurati di aggiungere l'URL <strong>{window.location.origin}</strong> alle restrizioni HTTP dell'API Google Maps.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  // Contenuto principale della mappa integrato con GoogleMapsErrorHandler
  const mapContent = (
    <div className="w-full space-y-6">
      <div className="p-6 bg-white rounded-lg shadow-lg border border-gray-100">
        {/* Input di ricerca con autocompletamento */}
        <div className="mb-6">
          <AddressAutocompleteInput
            value={address}
            onChange={setAddress}
            onSelect={(location) => {
              // Aggiorna direttamente lo stato
              setSelectedLocation(location);
              
              // Aggiorna mappa e marker
              if (mapInstanceRef.current) {
                const position = { lat: location.lat, lng: location.lng };
                
                // Pulisci marker esistenti
                markersRef.current.forEach(marker => marker.setMap(null));
                markersRef.current = [];
                
                // Centra la mappa
                mapInstanceRef.current.setCenter(position);
                mapInstanceRef.current.setZoom(15);
                
                // Crea nuovo marker
                const marker = new google.maps.Marker({
                  position,
                  map: mapInstanceRef.current,
                  title: location.address,
                  animation: google.maps.Animation.DROP
                });
                markersRef.current.push(marker);
                
                // Aggiorna la street view
                if (panoramaRef.current) {
                  panoramaRef.current.setPosition(position);
                  panoramaRef.current.setVisible(true);
                }
              }
            }}
            placeholder="Inserisci un indirizzo (es. Roma, Italia)"
            label="Cerca indirizzo"
            helpText="Digita almeno 2 caratteri per vedere i suggerimenti"
            error={address.includes('⚠️') || address === 'Indirizzo non trovato'}
          />
        </div>

        {/* Container mappe */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mappa */}
          <div className="h-[450px] rounded-lg overflow-hidden shadow-md border border-gray-200 relative">
            <div 
              ref={mapContainerRef} 
              className="h-full w-full"
              aria-label="Google Map"
            ></div>
            <div className="absolute bottom-2 right-2 bg-white shadow-md p-2 rounded-md text-xs text-gray-500">
              © Google Maps
            </div>
          </div>
          
          {/* Street View */}
          <div className="h-[450px] rounded-lg overflow-hidden shadow-md border border-gray-200 relative">
            <div 
              ref={streetViewContainerRef} 
              className="h-full w-full flex items-center justify-center bg-gray-100"
            >
              {!selectedLocation && (
                <div className="text-center p-6">
                  <MapIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">
                    Seleziona un indirizzo sulla mappa per visualizzare Street View
                  </p>
                </div>
              )}
            </div>
            <div className="absolute bottom-2 right-2 bg-white shadow-md p-2 rounded-md text-xs text-gray-500">
              © Google Street View
            </div>
          </div>
        </div>
        
        {/* Informazioni sulla posizione selezionata */}
        {selectedLocation && (
          <div className="mt-6 p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-medium text-lg text-primary-foreground">Posizione selezionata</h3>
                <p className="mt-2 text-muted-foreground">{selectedLocation.address}</p>
                <p className="text-xs mt-1 text-muted-foreground">
                  Coordinate: <span className="font-mono">{selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}</span>
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Suggerimenti e aiuto */}
        <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-100">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <p className="text-sm text-amber-800">
                <strong>Suggerimento:</strong> Puoi anche spostare il punto sulla mappa per esplorare diverse aree. Lo Street View mostrerà automaticamente la vista stradale se disponibile per quella posizione.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Implementazione del componente LeafletMapIntegration come fallback
  const leafletFallback = <LeafletMapIntegration />;
  
  // Return finale con il gestore di errori di Google Maps
  return (
    <GoogleMapsErrorHandler fallbackComponent={leafletFallback}>
      {mapContent}
    </GoogleMapsErrorHandler>
  );
}