import React, { useEffect, useRef } from 'react';
import { Marker } from '@/lib/maps';
import { useGoogleMapsApi } from '@/lib/maps-loader';
import { Loader2 } from 'lucide-react';

interface MapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: Marker[];
  onMarkerClick?: (markerId: number) => void;
  className?: string;
  showCluster?: boolean;
}

export function Map({
  center = { lat: 41.9028, lng: 12.4964 }, // Roma come default
  zoom = 12,
  markers = [],
  onMarkerClick,
  className = "w-full h-96",
  showCluster = false
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const mapId = useRef(`google-map-${Math.random().toString(36).substring(2, 9)}`).current;
  const { isLoaded, error } = useGoogleMapsApi();
  
  // Effetto per inizializzare la mappa
  useEffect(() => {
    if (!isLoaded || !mapRef.current || !window.google) return;

    try {
      // Elimina eventuali marker esistenti
      if (markersRef.current.length > 0) {
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];
      }

      // Crea la mappa se non esiste
      if (!googleMapRef.current) {
        googleMapRef.current = new window.google.maps.Map(document.getElementById(mapId)!, {
          center,
          zoom,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }],
            },
          ],
        });
      } else {
        googleMapRef.current.setCenter(center);
      }

      // Aggiungi i marker
      const newMarkers = markers.map(markerData => {
        const marker = new window.google.maps.Marker({
          position: markerData.position,
          map: googleMapRef.current,
          title: markerData.title,
          icon: markerData.icon,
        });

        // Se c'è un contenuto info window, crea l'info window
        if (markerData.info) {
          const infoWindow = new window.google.maps.InfoWindow({
            content: markerData.info,
          });

          marker.addListener('click', () => {
            infoWindow.open(googleMapRef.current, marker);
          });
        }

        // Aggiungi il click handler se fornito
        if (onMarkerClick) {
          marker.addListener('click', () => {
            onMarkerClick(markerData.id);
          });
        }

        return marker;
      });

      markersRef.current = newMarkers;

      // Aggiungi cluster se richiesto
      if (showCluster && window.google.maps.MarkerClusterer) {
        new window.google.maps.MarkerClusterer(googleMapRef.current, newMarkers, {
          imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
        });
      }
    } catch (err) {
      console.error('Errore durante l\'inizializzazione della mappa:', err);
    }

    // Cleanup
    return () => {
      if (markersRef.current.length > 0) {
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];
      }
    };
  }, [isLoaded]); // Dipendenze minimali per evitare loop infiniti

  // Se l'API non è ancora caricata, mostra un loader
  if (!isLoaded) {
    return (
      <div className={`${className} flex items-center justify-center bg-muted/20`}>
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Caricamento mappa...</p>
        </div>
      </div>
    );
  }

  // Se c'è stato un errore durante il caricamento dell'API, mostra un messaggio di errore
  if (error) {
    return (
      <div className={`${className} flex items-center justify-center bg-destructive/10`}>
        <div className="flex flex-col items-center gap-2 max-w-md text-center p-4">
          <p className="text-destructive font-semibold">Errore nel caricamento di Google Maps</p>
          <p className="text-sm text-muted-foreground">
            Non è stato possibile caricare la mappa. Riprova più tardi o contatta l'assistenza.
          </p>
          {error.message && (
            <p className="text-xs text-muted-foreground mt-2">
              Dettaglio: {error.message}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div id={mapId} ref={mapRef} className="w-full h-full rounded-xl overflow-hidden" />
    </div>
  );
}