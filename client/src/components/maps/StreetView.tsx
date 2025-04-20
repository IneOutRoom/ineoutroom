import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface StreetViewProps {
  position: {
    lat: number;
    lng: number;
  };
  pov?: {
    heading?: number;
    pitch?: number;
  };
  zoom?: number;
  height?: string | number;
  width?: string | number;
  className?: string;
}

// Estende l'interfaccia Window globale
declare global {
  interface Window {
    google: typeof google;
  }
}

export default function StreetView({
  position,
  pov = { heading: 34, pitch: 10 },
  zoom = 1,
  height = '400px',
  width = '100%',
  className = ''
}: StreetViewProps) {
  const streetViewRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadStreetView = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Verifica se l'API di Google Maps è già caricata
        if (!(window.google && window.google.maps)) {
          const loader = new Loader({
            apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
            version: 'weekly',
            libraries: ['places']
          });
          
          await loader.load();
        }
        
        if (!streetViewRef.current) {
          setError('Riferimento allo Street View non trovato.');
          setLoading(false);
          return;
        }
        
        // Crea una posizione Google Maps
        const location = new google.maps.LatLng(position.lat, position.lng);
        
        // Controlla se Street View è disponibile per questa posizione
        const streetViewService = new google.maps.StreetViewService();
        
        streetViewService.getPanorama(
          { location, radius: 100 },
          (data, status) => {
            if (status === google.maps.StreetViewStatus.OK && streetViewRef.current) {
              // Street View disponibile, mostra la vista
              const panorama = new google.maps.StreetViewPanorama(streetViewRef.current, {
                position: location,
                pov: {
                  heading: pov.heading || 34,
                  pitch: pov.pitch || 10
                },
                zoom: zoom,
                addressControl: true,
                fullscreenControl: true,
                linksControl: true,
                panControl: true,
                zoomControl: true,
                motionTracking: false,
                motionTrackingControl: false,
              });
              
              setLoading(false);
            } else {
              // Street View non disponibile
              setError(`Street View non è disponibile per questa posizione. (Status: ${status})`);
              setLoading(false);
            }
          }
        );
      } catch (err) {
        setError('Errore nel caricamento di Street View.');
        setLoading(false);
        console.error('Errore Street View:', err);
      }
    };
    
    if (streetViewRef.current) {
      loadStreetView();
    }
    
    return () => {
      // Pulizia se necessario
      if (streetViewRef.current && window.google && window.google.maps) {
        // Pulizia di eventuali listener
      }
    };
  }, [position, pov, zoom]);
  
  if (loading) {
    return (
      <div 
        className={`animate-pulse bg-gray-100 flex items-center justify-center ${className}`}
        style={{ height, width }}
      >
        <div className="text-gray-400">Caricamento Street View...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div 
        className={`bg-red-50 p-4 rounded-md text-red-500 border border-red-200 flex items-center justify-center ${className}`}
        style={{ height, width }}
      >
        <div>
          <p className="font-medium">{error}</p>
          <p className="text-sm mt-2">
            Prova una posizione diversa o controlla la tua connessione internet.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      ref={streetViewRef} 
      className={`shadow-md ${className}`}
      style={{ height, width, borderRadius: '8px' }}
    ></div>
  );
}