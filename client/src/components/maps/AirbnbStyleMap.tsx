import React, { useState, useCallback, useRef, useEffect } from 'react';
import { DynamicGoogleMap } from './DynamicGoogleMap';
import type { MapMarker } from './GoogleMapComponent';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SearchX, Maximize2, Minimize2, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export type PropertyListing = {
  id: number;
  title: string;
  address: string;
  propertyType: 'stanza_singola' | 'stanza_doppia' | 'monolocale' | 'bilocale' | 'altro';
  price: number;
  city: string;
  zone: string | null;
  photos: string[];
  latitude: number;
  longitude: number;
  isAvailable?: boolean;
  featuredPhoto?: string;
  isVerified?: boolean;
};

interface AirbnbStyleMapProps {
  listings: PropertyListing[];
  className?: string;
  initialCenter?: { lat: number; lng: number };
  initialZoom?: number;
  onListingClick?: (listing: PropertyListing) => void;
  selectedListingId?: number | null;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  showCardList?: boolean;
}

export function AirbnbStyleMap({
  listings = [],
  className = '',
  initialCenter = { lat: 41.9028, lng: 12.4964 }, // Default: Roma
  initialZoom = 12,
  onListingClick,
  selectedListingId = null,
  isFullscreen = false,
  onToggleFullscreen = () => {},
  showCardList = true
}: AirbnbStyleMapProps) {
  const [center, setCenter] = useState(initialCenter);
  const [zoom, setZoom] = useState(initialZoom);
  const [hoveredListingId, setHoveredListingId] = useState<number | null>(null);
  const [visibleListings, setVisibleListings] = useState<PropertyListing[]>(listings);
  const [error, setError] = useState<string | null>(null);
  
  // Riferimento allo slider di card
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  
  // Sliders per le card nella vista mobile
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showCardControls, setShowCardControls] = useState(false);

  // Aggiorna visibleListings quando listings cambia
  useEffect(() => {
    setVisibleListings(listings);
  }, [listings]);

  // Calcola i bounds per centrare la mappa su tutti i listing
  useEffect(() => {
    if (listings.length === 0) return;
  
    if (listings.length === 1) {
      setCenter({
        lat: listings[0].latitude,
        lng: listings[0].longitude
      });
      setZoom(15);
      return;
    }
    
    try {
      // Calcolo dinamico dei bounds (solo lato client)
      if (typeof window !== 'undefined' && window.google && window.google.maps) {
        const bounds = new window.google.maps.LatLngBounds();
        listings.forEach(listing => {
          bounds.extend({
            lat: listing.latitude,
            lng: listing.longitude
          });
        });
        
        // Centra la mappa sui bounds calcolati
        const center = {
          lat: (bounds.getNorthEast().lat() + bounds.getSouthWest().lat()) / 2,
          lng: (bounds.getNorthEast().lng() + bounds.getSouthWest().lng()) / 2
        };
        
        setCenter(center);
        
        // Calcola il livello di zoom appropriato
        const GLOBE_HEIGHT = 256;
        const mapWidth = 800; // Valore approssimativo
        const mapHeight = 400; // Valore approssimativo
        
        const latDiff = bounds.getNorthEast().lat() - bounds.getSouthWest().lat();
        const lngDiff = bounds.getNorthEast().lng() - bounds.getSouthWest().lng();
        
        const latZoom = Math.floor(Math.log2(360 * mapHeight / latDiff / GLOBE_HEIGHT));
        const lngZoom = Math.floor(Math.log2(360 * mapWidth / lngDiff / GLOBE_HEIGHT));
        
        setZoom(Math.min(latZoom, lngZoom, 15) - 1); // -1 per un po' di margine
      }
    } catch (e) {
      console.error('Errore nel calcolo dei bounds:', e);
      // Fallback: usa il centro di tutti i listing
      const avgLat = listings.reduce((sum, l) => sum + l.latitude, 0) / listings.length;
      const avgLng = listings.reduce((sum, l) => sum + l.longitude, 0) / listings.length;
      
      setCenter({ lat: avgLat, lng: avgLng });
      setZoom(13); // Zoom predefinito per il fallback
    }
  }, [listings]);

  // Aggiorna il centro e lo zoom quando viene selezionato un listing
  useEffect(() => {
    if (selectedListingId !== null) {
      const selectedListing = listings.find(l => l.id === selectedListingId);
      if (selectedListing) {
        setCenter({
          lat: selectedListing.latitude,
          lng: selectedListing.longitude
        });
        setZoom(16);
        
        // Scroll alla card corrispondente
        if (showCardList && cardsContainerRef.current) {
          const index = listings.findIndex(l => l.id === selectedListingId);
          setCurrentCardIndex(index > -1 ? index : 0);
          
          // Calcola lo scroll necessario
          const cardWidth = 280; // Larghezza approssimativa di una card con margini
          const scrollPosition = index * cardWidth;
          
          cardsContainerRef.current.scrollTo({
            left: scrollPosition,
            behavior: 'smooth'
          });
        }
      }
    }
  }, [selectedListingId, listings, showCardList]);

  // Prepara i marker per Google Maps
  const markers: MapMarker[] = visibleListings.map(listing => {
    const isSelected = listing.id === selectedListingId;
    const isHovered = listing.id === hoveredListingId;
    
    // Determina colore e stile del marker in base allo stato
    const markerColor = isSelected || isHovered ? '#6a0dad' : '#333333';
    const markerSize = isSelected || isHovered ? '1.3' : '1';
    const zIndex = isSelected || isHovered ? 1000 : 1;
    
    return {
      id: listing.id,
      position: {
        lat: listing.latitude,
        lng: listing.longitude
      },
      title: listing.title,
      content: (
        <div className="p-2">
          <h3 className="font-semibold text-sm mb-1">{listing.title}</h3>
          <p className="text-xs text-muted-foreground">{listing.address}</p>
          <p className="text-primary font-medium mt-1">€{listing.price}/mese</p>
        </div>
      ),
      // Crea marker dinamico in stile Airbnb
      // Utilizziamo solo l'URL per l'icona per compatibilità con il tipo MapMarker
      icon: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g transform="scale(${markerSize})">
            <circle cx="15" cy="15" r="13" fill="white" stroke="${markerColor}" stroke-width="2"/>
            <text x="15" y="18" font-family="Arial" font-size="11" text-anchor="middle" fill="${markerColor}">€${listing.price}</text>
          </g>
        </svg>
      `)}`
    };
  });

  // Gestisce il click su un marker
  const handleMarkerClick = (marker: MapMarker) => {
    const listingId = Number(marker.id);
    const listing = listings.find(l => l.id === listingId);
    
    if (listing && onListingClick) {
      onListingClick(listing);
    }
  };

  // Gestisce il passaggio del mouse su una card
  const handleCardMouseEnter = (listingId: number) => {
    setHoveredListingId(listingId);
  };

  // Gestisce l'uscita del mouse da una card
  const handleCardMouseLeave = () => {
    setHoveredListingId(null);
  };

  // Logica per la navigazione delle cards (mobile)
  const goToPrevCard = () => {
    const newIndex = Math.max(0, currentCardIndex - 1);
    setCurrentCardIndex(newIndex);
    scrollToCard(newIndex);
  };

  const goToNextCard = () => {
    const newIndex = Math.min(listings.length - 1, currentCardIndex + 1);
    setCurrentCardIndex(newIndex);
    scrollToCard(newIndex);
  };

  const scrollToCard = (index: number) => {
    if (cardsContainerRef.current) {
      const cardWidth = 280; // Larghezza approssimativa di una card con margini
      cardsContainerRef.current.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth'
      });
    }
  };

  // Se ci sono errori, mostra un messaggio
  if (error) {
    return (
      <div className={`${className} flex flex-col items-center justify-center bg-muted/10 rounded-lg p-6 min-h-[400px]`}>
        <SearchX className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Impossibile caricare la mappa</h3>
        <p className="text-muted-foreground text-center max-w-md">{error}</p>
      </div>
    );
  }

  // Ottieni il tipo di proprietà in italiano
  const getPropertyTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      'stanza_singola': 'Stanza singola',
      'stanza_doppia': 'Stanza doppia',
      'monolocale': 'Monolocale',
      'bilocale': 'Bilocale',
      'altro': 'Altro'
    };
    return typeMap[type] || 'Alloggio';
  };

  return (
    <div 
      className={cn(
        'flex flex-col w-full h-full rounded-lg overflow-hidden transition-all duration-300',
        isFullscreen ? 'fixed inset-0 z-50 bg-background' : 'relative',
        className
      )}
    >
      {/* Controllo fullscreen */}
      <Button 
        variant="outline" 
        size="sm"
        className="absolute top-2 right-2 z-10 bg-background/80 backdrop-blur-sm hover:bg-background"
        onClick={onToggleFullscreen}
      >
        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
      </Button>
      
      {/* Mappa Google */}
      <div className={`relative ${isFullscreen ? 'flex-grow' : 'h-[400px]'}`}>
        <DynamicGoogleMap
          center={center}
          zoom={zoom}
          markers={markers}
          onMarkerClick={handleMarkerClick}
          className="w-full h-full"
          showInfoWindowOnHover={true}
          options={{
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
              }
            ],
            fullscreenControl: false,
            mapTypeControl: false,
            streetViewControl: false,
            zoomControlOptions: {
              // Google Maps controllerà la posizione correttamente
              // quando la mappa sarà caricata lato client
              position: 3 // 3 è il valore per RIGHT_TOP nella SDK Google Maps
            }
          }}
        />
      </div>
      
      {/* Lista card in stile Airbnb */}
      {showCardList && (
        <div className="mt-4 relative">
          {/* Controlli per mobile (prev/next) */}
          {listings.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full shadow-md"
                onClick={goToPrevCard}
                disabled={currentCardIndex === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full shadow-md"
                onClick={goToNextCard}
                disabled={currentCardIndex >= listings.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
          
          {/* Contenitore scrollabile */}
          <div 
            ref={cardsContainerRef}
            className="flex overflow-x-auto pb-4 px-4 gap-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-primary/40 scrollbar-track-transparent"
            onMouseEnter={() => setShowCardControls(true)}
            onMouseLeave={() => setShowCardControls(false)}
          >
            {listings.map((listing, index) => (
              <Card 
                key={`listing-card-${listing.id}`}
                className={cn(
                  'flex-shrink-0 w-[260px] snap-center transition-all duration-200 border cursor-pointer',
                  listing.id === selectedListingId || listing.id === hoveredListingId 
                    ? 'ring-2 ring-primary shadow-md scale-[1.02]' 
                    : 'hover:shadow-md hover:border-primary/50',
                )}
                onClick={() => onListingClick && onListingClick(listing)}
                onMouseEnter={() => handleCardMouseEnter(listing.id)}
                onMouseLeave={handleCardMouseLeave}
              >
                <CardContent className="p-3">
                  {/* Immagine */}
                  <div className="relative w-full h-[140px] rounded-md overflow-hidden mb-2">
                    <img 
                      src={listing.featuredPhoto || listing.photos[0] || '/placeholder-property.jpg'} 
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                    {listing.isVerified && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#6a0dad" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Proprietà verificata</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    <Badge 
                      variant="secondary" 
                      className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm"
                    >
                      €{listing.price}/mese
                    </Badge>
                  </div>
                  
                  {/* Titolo e Informazioni */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-sm line-clamp-1">{listing.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        {getPropertyTypeLabel(listing.propertyType)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                      <span className="line-clamp-1">
                        {listing.zone 
                          ? `${listing.zone}, ${listing.city}` 
                          : listing.city}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {listings.length === 0 && (
              <div className="flex items-center justify-center w-full p-6">
                <p className="text-muted-foreground">Nessun risultato trovato</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}