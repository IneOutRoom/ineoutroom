// components/maps/InteractiveMap.jsx
import { useEffect, useRef, useState } from 'react';
import { Badge } from '../../client/src/components/ui/badge';
import { 
  Home, 
  BedSingle, 
  Bed, 
  Building, 
  MapPin,
  Euro
} from 'lucide-react';

// Helper per tradurre il tipo di proprietà
const getPropertyTypeLabel = (type) => {
  switch (type) {
    case 'stanza_singola': return 'Stanza singola';
    case 'stanza_doppia': return 'Stanza doppia';
    case 'monolocale': return 'Monolocale';
    case 'bilocale': return 'Bilocale';
    default: return type;
  }
};

// Helper per ottenere l'icona del tipo di proprietà
const getPropertyTypeIcon = (type) => {
  switch (type) {
    case 'stanza_singola': return <BedSingle className="h-4 w-4" />;
    case 'stanza_doppia': return <Bed className="h-4 w-4" />;
    case 'monolocale': return <Home className="h-4 w-4" />;
    case 'bilocale': 
    default: return <Building className="h-4 w-4" />;
  }
};

// Generatore di colori per il marker in base al tipo di proprietà
const getPropertyTypeColor = (type) => {
  switch (type) {
    case 'stanza_singola': return '#3b82f6'; // blue-500
    case 'stanza_doppia': return '#8b5cf6'; // purple-500
    case 'monolocale': return '#10b981'; // green-500
    case 'bilocale': return '#f59e0b'; // amber-500
    default: return '#6b7280'; // gray-500
  }
};

export default function InteractiveMap({ 
  listings = [], 
  onBoundsChange, 
  onMarkerClick,
  className = ''
}) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const infoWindowRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Inizializza la mappa Google quando lo script è pronto
  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current) return;
      
      try {
        // Inizializza la mappa con centro sull'Europa
        mapInstance.current = new window.google.maps.Map(mapRef.current, {
          center: { lat: 45.0, lng: 10.0 }, // Europa centrale
          zoom: 5,
          mapTypeControl: true,
          mapTypeControlOptions: {
            style: window.google.maps.MapTypeControlStyle.DROPDOWN_MENU,
            position: window.google.maps.ControlPosition.TOP_RIGHT
          },
          streetViewControl: true,
          fullscreenControl: true,
          gestureHandling: 'cooperative'
        });

        // Crea l'infoWindow per i marker
        infoWindowRef.current = new window.google.maps.InfoWindow();
        
        // Listener: quando la mappa smette di muoversi (idle), aggiorna bounds
        window.google.maps.event.addListener(mapInstance.current, 'idle', () => {
          if (!mapInstance.current) return;
          
          // Ottieni i confini attuali della mappa
          const boundsObj = mapInstance.current.getBounds();
          if (boundsObj && onBoundsChange) {
            const ne = boundsObj.getNorthEast();
            const sw = boundsObj.getSouthWest();
            onBoundsChange({
              north: ne.lat(), 
              south: sw.lat(), 
              east: ne.lng(), 
              west: sw.lng(),
              zoom: mapInstance.current.getZoom()
            });
          }
        });
        
        setIsLoading(false);
      } catch (err) {
        console.error('Errore nell\'inizializzazione della mappa Google:', err);
        setError('Si è verificato un errore nel caricamento della mappa. Riprova più tardi.');
        setIsLoading(false);
      }
    };

    // Funzione per controllare se l'API Google Maps è pronta
    const checkGoogleMapsReady = () => {
      if (window.google && window.google.maps) {
        initMap();
        return true;
      }
      return false;
    };

    // Se l'API è già caricata, inizializza subito la mappa
    if (checkGoogleMapsReady()) {
      return;
    }

    // Altrimenti, controlla periodicamente fino a quando non è pronta
    const interval = setInterval(() => {
      if (checkGoogleMapsReady()) {
        clearInterval(interval);
      }
    }, 300);

    return () => {
      clearInterval(interval);
      
      // Cleanup: rimuovi tutti i marker quando il componente viene smontato
      if (markersRef.current) {
        markersRef.current.forEach(marker => {
          if (marker) marker.setMap(null);
        });
        markersRef.current = [];
      }
      
      // Chiudi infoWindow se aperta
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }
    };
  }, []); // Dipendenze vuote: questo useEffect deve eseguire solo al mount

  // Aggiorna i marker sulla mappa quando cambia la lista di annunci
  useEffect(() => {
    if (!mapInstance.current || !window.google) return;
    
    // Rimuovi marker esistenti
    markersRef.current.forEach(marker => {
      if (marker) marker.setMap(null);
    });
    markersRef.current = [];
    
    // Aggiungi nuovi marker
    listings.forEach(listing => {
      if (!listing.lat || !listing.lng) return;
      
      try {
        // Crea marker personalizzato con colore in base al tipo di proprietà
        const markerColor = getPropertyTypeColor(listing.propertyType);
        
        // Crea un marker SVG personalizzato
        const svgMarker = {
          path: "M12 0C8.3 0 5.3 3 5.3 6.6c0 3.5 2.2 6.3 6.7 12.4 4.5-6.1 6.7-8.9 6.7-12.4C18.7 3 15.7 0 12 0z",
          fillColor: markerColor,
          fillOpacity: 1,
          strokeWeight: 1,
          strokeColor: "#ffffff",
          scale: 1.5,
          labelOrigin: new window.google.maps.Point(12, 7),
          anchor: new window.google.maps.Point(12, 19)
        };
        
        // Crea il marker
        const marker = new window.google.maps.Marker({
          position: { lat: listing.lat, lng: listing.lng },
          map: mapInstance.current,
          title: listing.title,
          icon: svgMarker,
          label: {
            text: `€${listing.price}`,
            color: "white",
            fontSize: "10px",
            fontWeight: "bold"
          },
          animation: window.google.maps.Animation.DROP,
          optimized: true
        });
        
        // Crea contenuto InfoWindow
        const infoWindowContent = `
          <div style="max-width:250px;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;">
            <h3 style="margin:0 0 5px;font-size:16px;color:#1f2937;">${listing.title}</h3>
            <div style="margin:5px 0;font-size:14px;color:#6b7280;">
              <span>${listing.city}${listing.zone ? `, ${listing.zone}` : ''}</span>
            </div>
            <div style="display:flex;align-items:center;margin:5px 0;font-size:14px;">
              <div style="display:inline-block;padding:2px 5px;background:${markerColor};color:white;border-radius:4px;font-size:12px;margin-right:5px;">
                ${getPropertyTypeLabel(listing.propertyType)}
              </div>
              <div style="font-weight:bold;color:#6a0dad;">€${listing.price}<span style="font-weight:normal;font-size:12px;">/mese</span></div>
            </div>
            <div style="margin-top:8px;">
              <button 
                style="background:#6a0dad;color:white;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;font-size:12px;"
                onclick="window.location.href='/annunci/${listing.id}'"
              >
                Visualizza dettagli
              </button>
            </div>
          </div>
        `;
        
        // Aggiungi listener per il click sul marker
        marker.addListener('click', () => {
          // Chiudi info window precedente
          if (infoWindowRef.current) {
            infoWindowRef.current.close();
          }
          
          // Apri nuova info window
          infoWindowRef.current.setContent(infoWindowContent);
          infoWindowRef.current.open({
            anchor: marker,
            map: mapInstance.current
          });
          
          // Notifica il click sul marker
          if (onMarkerClick) {
            onMarkerClick(listing);
          }
        });
        
        // Salva il marker nel riferimento
        markersRef.current.push(marker);
      } catch (err) {
        console.error('Errore nella creazione del marker:', err);
      }
    });
    
    // Se ci sono annunci ma nessuno ha coordinate, centra la mappa sull'Europa
    if (listings.length > 0 && markersRef.current.length === 0) {
      mapInstance.current.setCenter({ lat: 45.0, lng: 10.0 });
      mapInstance.current.setZoom(5);
      return;
    }
    
    // Se c'è solo un marker, centra la mappa su di esso
    if (markersRef.current.length === 1) {
      const marker = markersRef.current[0];
      mapInstance.current.setCenter(marker.getPosition());
      mapInstance.current.setZoom(14);
      return;
    }
    
    // Se ci sono più marker, adatta la mappa per visualizzarli tutti
    if (markersRef.current.length > 1) {
      const bounds = new window.google.maps.LatLngBounds();
      markersRef.current.forEach(marker => {
        bounds.extend(marker.getPosition());
      });
      mapInstance.current.fitBounds(bounds);
      
      // Limita lo zoom massimo
      window.google.maps.event.addListenerOnce(mapInstance.current, 'idle', () => {
        if (mapInstance.current.getZoom() > 15) {
          mapInstance.current.setZoom(15);
        }
      });
    }
  }, [listings, onMarkerClick]);

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center p-4 bg-gray-100 rounded-lg text-red-500 ${className}`} style={{ height: '100%', minHeight: '400px' }}>
        <MapPin className="h-12 w-12 text-red-300 mb-4" />
        <p className="text-center">{error}</p>
      </div>
    );
  }

  return (
    <div 
      className={`relative rounded-lg overflow-hidden shadow-md ${className}`} 
      style={{ height: '100%', minHeight: '400px' }}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-10">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      
      {/* Badge con conteggio annunci */}
      <div className="absolute bottom-2 left-2 z-10">
        <Badge variant="secondary" className="bg-white shadow-md">
          {listings.length} {listings.length === 1 ? 'annuncio' : 'annunci'}
        </Badge>
      </div>
    </div>
  );
}