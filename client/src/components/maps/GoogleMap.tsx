import React, { useCallback, useState } from 'react';
import { GoogleMap as GoogleMapComponent, useLoadScript, Marker, InfoWindow } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '8px'
};

// Opzioni mappa
const options = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: true,
  streetViewControl: true,
  fullscreenControl: true,
};

interface MapMarker {
  id: string;
  position: {
    lat: number;
    lng: number;
  };
  title?: string;
  description?: string;
  icon?: string;
}

interface GoogleMapProps {
  center: {
    lat: number;
    lng: number;
  };
  zoom?: number;
  markers?: MapMarker[];
  onClick?: (e: google.maps.MapMouseEvent) => void;
  onMarkerClick?: (marker: MapMarker) => void;
  className?: string;
}

export default function GoogleMap({
  center,
  zoom = 14,
  markers = [],
  onClick,
  onMarkerClick,
  className = ''
}: GoogleMapProps) {
  // Caricamento della libreria Maps
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
    libraries: ['places']
  });

  // Stato per la finestra informativa
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);

  // Callback per quando la mappa è caricata
  const onMapLoad = useCallback((map: google.maps.Map) => {
    console.log('Google Maps caricata con successo');
  }, []);

  // Se c'è un errore nel caricamento
  if (loadError) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-red-500 border border-red-200">
        <p>Errore nel caricamento di Google Maps. Riprova più tardi.</p>
        <p className="text-xs mt-2">Dettagli: {loadError.message}</p>
      </div>
    );
  }

  // Se la mappa non è ancora caricata
  if (!isLoaded) {
    return (
      <div className="animate-pulse bg-gray-100 rounded-md flex items-center justify-center" style={{ height: '400px' }}>
        <div className="text-gray-400">Caricamento mappa...</div>
      </div>
    );
  }

  return (
    <div className={`shadow-md ${className}`}>
      <GoogleMapComponent
        mapContainerStyle={containerStyle}
        center={center}
        zoom={zoom}
        options={options}
        onClick={onClick}
        onLoad={onMapLoad}
      >
        {/* Markers */}
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={marker.position}
            title={marker.title}
            icon={marker.icon}
            onClick={() => {
              setSelectedMarker(marker);
              if (onMarkerClick) onMarkerClick(marker);
            }}
          />
        ))}

        {/* Info Window */}
        {selectedMarker && (
          <InfoWindow
            position={selectedMarker.position}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div className="p-2">
              {selectedMarker.title && (
                <h3 className="font-semibold text-gray-900">{selectedMarker.title}</h3>
              )}
              {selectedMarker.description && (
                <p className="text-sm text-gray-700 mt-1">{selectedMarker.description}</p>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMapComponent>
    </div>
  );
}