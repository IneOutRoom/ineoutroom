import React, { lazy, Suspense } from 'react';
import { GoogleMapsProvider } from './GoogleMapsProvider';
import { MapMarker } from './GoogleMapComponent';

// Lazy loading del componente GoogleMapComponent
const GoogleMapComponent = lazy(() => 
  import('./GoogleMapComponent').then(module => ({ default: module.GoogleMapComponent }))
);

// Props per DynamicGoogleMap, identiche a quelle di GoogleMapComponent
interface DynamicGoogleMapProps {
  center?: google.maps.LatLngLiteral;
  zoom?: number;
  markers?: MapMarker[];
  onClick?: (e: google.maps.MapMouseEvent) => void;
  onMarkerClick?: (marker: MapMarker) => void;
  className?: string;
  options?: google.maps.MapOptions;
  showInfoWindowOnHover?: boolean;
}

/**
 * DynamicGoogleMap - Componente per caricare Google Maps dinamicamente (solo lato client)
 * 
 * Questo componente combina GoogleMapsProvider e GoogleMapComponent per fornire
 * un'unica interfaccia che gestisce sia il caricamento dell'API che la visualizzazione
 * della mappa, garantendo che venga caricata solo lato client.
 */
export function DynamicGoogleMap(props: DynamicGoogleMapProps) {
  return (
    <GoogleMapsProvider>
      <Suspense 
        fallback={
          <div className="flex justify-center items-center h-full w-full bg-background/50">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        }
      >
        <GoogleMapComponent {...props} />
      </Suspense>
    </GoogleMapsProvider>
  );
}