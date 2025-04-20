import React, { useEffect, useRef, useState } from 'react';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { cn } from '@/lib/utils';

// Definizione dei tipi per i marker sulla mappa
export interface MapMarker {
  id: string | number;
  position: google.maps.LatLngLiteral;
  title?: string;
  content?: React.ReactNode;
  icon?: string | google.maps.Icon | google.maps.Symbol;
}

// Props per il componente della mappa Google
interface GoogleMapComponentProps {
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
 * GoogleMapComponent - Componente base per la visualizzazione della mappa Google
 * 
 * Questo componente è responsabile di renderizzare la mappa Google con marker
 * e finestre informative (infowindow) e gestire le interazioni con la mappa.
 * Deve essere usato all'interno di GoogleMapsProvider o LoadScript.
 */
export function GoogleMapComponent({
  center = { lat: 45.4642, lng: 9.1900 }, // Default: Milano
  zoom = 10,
  markers = [],
  onClick,
  onMarkerClick,
  className = '',
  options = {},
  showInfoWindowOnHover = false
}: GoogleMapComponentProps) {
  // Riferimento alla mappa
  const mapRef = useRef<google.maps.Map | null>(null);
  
  // Stato per gestire la finestra informativa
  const [infoWindow, setInfoWindow] = useState<{
    marker: MapMarker;
    position: google.maps.LatLngLiteral;
  } | null>(null);
  
  // Stato per la gestione dell'hover sui marker
  const [hoveredMarkerId, setHoveredMarkerId] = useState<string | number | null>(null);
  
  // Callback quando la mappa è caricata
  const handleMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
  };
  
  // Gestisce il click sulla mappa
  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    // Chiude la finestra informativa se aperta
    setInfoWindow(null);
    
    // Propaga l'evento al genitore
    if (onClick) {
      onClick(e);
    }
  };
  
  // Gestisce il click su un marker
  const handleMarkerClick = (marker: MapMarker) => {
    // Apre una finestra informativa sul marker cliccato
    if (marker.content) {
      setInfoWindow({
        marker,
        position: marker.position
      });
    }
    
    // Propaga l'evento al genitore
    if (onMarkerClick) {
      onMarkerClick(marker);
    }
  };
  
  // Gestisce l'hover su un marker
  const handleMarkerMouseOver = (marker: MapMarker) => {
    if (showInfoWindowOnHover && marker.content) {
      setHoveredMarkerId(marker.id);
    }
  };
  
  // Gestisce l'uscita dell'hover da un marker
  const handleMarkerMouseOut = () => {
    if (showInfoWindowOnHover) {
      setHoveredMarkerId(null);
    }
  };
  
  // Chiude la finestra informativa
  const handleInfoWindowClose = () => {
    setInfoWindow(null);
  };
  
  // Opzioni di default per la mappa
  const defaultOptions: google.maps.MapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    clickableIcons: false,
    scrollwheel: true,
    ...options
  };
  
  return (
    <div className={cn('w-full h-full relative overflow-hidden', className)}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={center}
        zoom={zoom}
        options={defaultOptions}
        onClick={handleMapClick}
        onLoad={handleMapLoad}
      >
        {/* Rendering dei marker */}
        {markers.map((marker) => (
          <Marker
            key={`marker-${marker.id}`}
            position={marker.position}
            title={marker.title}
            icon={marker.icon}
            onClick={() => handleMarkerClick(marker)}
            onMouseOver={() => handleMarkerMouseOver(marker)}
            onMouseOut={handleMarkerMouseOut}
          />
        ))}
        
        {/* Finestra informativa mostrata al click */}
        {infoWindow && (
          <InfoWindow
            position={infoWindow.position}
            onCloseClick={handleInfoWindowClose}
          >
            <div>{infoWindow.marker.content}</div>
          </InfoWindow>
        )}
        
        {/* Finestra informativa mostrata all'hover (se abilitata) */}
        {showInfoWindowOnHover && hoveredMarkerId !== null && !infoWindow && (
          <InfoWindow
            position={markers.find(m => m.id === hoveredMarkerId)?.position || center}
            onCloseClick={() => setHoveredMarkerId(null)}
          >
            <div>{markers.find(m => m.id === hoveredMarkerId)?.content}</div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}