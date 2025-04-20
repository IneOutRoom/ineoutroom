import React, { useEffect, useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Loader2, MapPin, Map, MapIcon, Lightbulb, AlertTriangle } from 'lucide-react';

type Props = {};

export function LeafletMapIntegration({}: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<{
    address: string;
    lat: number;
    lng: number;
  } | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    // Carica Leaflet solo una volta che il componente è montato
    const loadLeaflet = async () => {
      try {
        // Carica gli script e CSS necessari
        if (!document.getElementById('leaflet-css')) {
          const cssLink = document.createElement('link');
          cssLink.rel = 'stylesheet';
          cssLink.id = 'leaflet-css';
          cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          cssLink.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
          cssLink.crossOrigin = '';
          document.head.appendChild(cssLink);
        }

        // Controlla se Leaflet è già stato caricato
        if (typeof window.L === 'undefined') {
          // Carica lo script di Leaflet
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
            script.crossOrigin = '';
            script.async = true;
            script.onload = () => resolve();
            script.onerror = (e) => reject(new Error(`Errore nel caricamento di Leaflet: ${e}`));
            document.head.appendChild(script);
          });
        }

        setLoading(false);
      } catch (err) {
        console.error('Errore nel caricamento di Leaflet:', err);
        setError(`Errore nel caricamento della mappa: ${err instanceof Error ? err.message : 'Errore sconosciuto'}`);
        setLoading(false);
      }
    };

    loadLeaflet();
  }, []);

  // Inizializza la mappa quando Leaflet è stato caricato
  useEffect(() => {
    if (loading || !mapContainerRef.current || typeof window.L === 'undefined') return;

    try {
      // Inizializza la mappa
      if (!mapRef.current) {
        // Centro della mappa su Roma
        const initialPosition = [41.9028, 12.4964];
        
        // Crea la mappa
        mapRef.current = window.L.map(mapContainerRef.current).setView(initialPosition, 8);
        
        // Aggiungi i layer di base
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapRef.current);
        
        // Aggiungi un marker iniziale
        markerRef.current = window.L.marker(initialPosition).addTo(mapRef.current)
          .bindPopup('Roma')
          .openPopup();
        
        // Aggiungi event listener per click sulla mappa
        mapRef.current.on('click', (e: any) => {
          const { lat, lng } = e.latlng;
          
          // Aggiorna la posizione del marker
          if (markerRef.current) {
            markerRef.current.setLatLng(e.latlng);
          } else {
            markerRef.current = window.L.marker(e.latlng).addTo(mapRef.current);
          }
          
          // Esegui reverse geocoding usando API pubblica
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`)
            .then(response => response.json())
            .then(data => {
              const address = data.display_name;
              
              // Aggiorna il popup del marker
              markerRef.current.bindPopup(address).openPopup();
              
              // Aggiorna lo stato
              setSelectedLocation({
                address,
                lat,
                lng
              });
              
              setAddress(address);
            })
            .catch(err => {
              console.error('Errore nel geocoding inverso:', err);
              // Aggiorna comunque lo stato con le coordinate
              setSelectedLocation({
                address: `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`,
                lat,
                lng
              });
            });
        });
      }
    } catch (err) {
      console.error('Errore durante l\'inizializzazione della mappa:', err);
      setError(`Errore durante l'inizializzazione della mappa: ${err instanceof Error ? err.message : 'Errore sconosciuto'}`);
    }

    return () => {
      // Pulisci la mappa quando il componente viene smontato
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [loading]);

  // Mostra lo stato di caricamento
  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-lg text-muted-foreground">Caricamento mappa...</span>
      </div>
    );
  }

  // Mostra errori se presenti
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
        </div>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="p-6 bg-white rounded-lg shadow-lg border border-gray-100">
        {/* Input di ricerca */}
        <div className="mb-6">
          <label htmlFor="map-search" className="block text-sm font-medium text-gray-700 mb-1">
            Posizione corrente
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="map-search"
              type="text"
              placeholder="Clicca sulla mappa per selezionare una posizione"
              className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary text-base"
              value={address}
              readOnly
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Clicca direttamente sulla mappa per selezionare una posizione
          </p>
        </div>

        {/* Mappa */}
        <div className="h-[450px] rounded-lg overflow-hidden shadow-md border border-gray-200 relative">
          <div 
            ref={mapContainerRef} 
            className="h-full w-full"
            aria-label="Mappa"
          ></div>
          <div className="absolute bottom-2 right-2 bg-white shadow-md p-2 rounded-md text-xs text-gray-500">
            © OpenStreetMap contributors
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
                <strong>Suggerimento:</strong> Questa è una versione alternativa che utilizza OpenStreetMap invece di Google Maps. Clicca direttamente sulla mappa per selezionare una posizione e visualizzare le sue coordinate.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Type extension for Window to include Leaflet
declare global {
  interface Window {
    L: any;
  }
}