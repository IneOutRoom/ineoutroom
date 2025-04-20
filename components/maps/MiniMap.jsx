// components/maps/MiniMap.jsx
import { useEffect, useRef, useState } from 'react';
import { Button } from '../../client/src/components/ui/button';
import { ExternalLink } from 'lucide-react';

const MiniMap = ({ lat, lng, title, className = '' }) => {
  const mapRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!lat || !lng) {
      setIsLoading(false);
      setError("Coordinate non disponibili");
      return;
    }

    // Funzione per inizializzare la mappa
    const initMap = () => {
      if (!mapRef.current) return;
      
      try {
        const position = { lat, lng };
        const map = new window.google.maps.Map(mapRef.current, {
          center: position,
          zoom: 15,
          mapTypeControl: false,
          streetViewControl: true,
          fullscreenControl: false,
          zoomControl: true,
          scrollwheel: false,
          gestureHandling: 'cooperative'
        });
        
        // Aggiungi marker alla posizione
        const marker = new window.google.maps.Marker({
          position,
          map,
          title: title || "Posizione dell'annuncio",
          animation: window.google.maps.Animation.DROP
        });
        
        setIsLoading(false);
      } catch (err) {
        console.error("Errore nell'inizializzazione della mappa:", err);
        setError("Impossibile caricare la mappa");
        setIsLoading(false);
      }
    };

    // Controlla se l'API di Google Maps è pronta
    if (window.google && window.google.maps) {
      initMap();
    } else {
      // Aspetta che l'API sia caricata
      const checkGoogleMapsReady = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(checkGoogleMapsReady);
          initMap();
        }
      }, 300);
      
      // Pulisci l'intervallo quando il componente viene smontato
      return () => clearInterval(checkGoogleMapsReady);
    }
  }, [lat, lng, title]);

  // Helper per ottenere un link a Google Maps (per navigazione)
  const getGoogleMapsLink = () => {
    if (!lat || !lng) return "#";
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  };

  if (error) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`} style={{ height: '100%', minHeight: '200px' }}>
        <p className="text-muted-foreground text-center p-4">{error}</p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ height: '100%', minHeight: '200px' }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-10">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      
      {/* Link per ottenere indicazioni */}
      <div className="absolute bottom-2 right-2 z-10">
        <a href={getGoogleMapsLink()} target="_blank" rel="noopener noreferrer">
          <Button size="sm" variant="default" className="shadow-md">
            <ExternalLink className="h-4 w-4 mr-1.5" />
            Indicazioni
          </Button>
        </a>
      </div>
    </div>
  );
};

export default MiniMap;