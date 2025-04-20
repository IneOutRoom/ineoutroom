import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, ZoomIn, ZoomOut, Maximize, RotateCw, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import 'mapillary-js/dist/mapillary.css';

// Importazione dinamica per evitare problemi SSR
let mapillaryPromise: Promise<typeof import('mapillary-js')> | null = null;

interface MapillaryStreetViewProps {
  latitude: number;
  longitude: number;
  height?: number;
  className?: string;
}

export function MapillaryStreetView({
  latitude,
  longitude,
  height = 400,
  className = '',
}: MapillaryStreetViewProps) {
  const viewerContainerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [imageAvailable, setImageAvailable] = useState<boolean | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const { toast } = useToast();

  // Carica Mapillary dinamicamente (solo lato client)
  useEffect(() => {
    if (!mapillaryPromise) {
      mapillaryPromise = import('mapillary-js');
    }
    
    return () => {
      if (viewerRef.current) {
        viewerRef.current.remove();
        viewerRef.current = null;
      }
    };
  }, []);

  // Inizializza il visualizzatore Mapillary
  useEffect(() => {
    if (!viewerContainerRef.current || !latitude || !longitude) return;
    
    setLoading(true);
    
    const initMapillary = async () => {
      try {
        const Mapillary = await mapillaryPromise;
        
        if (!Mapillary) {
          console.error('Impossibile caricare Mapillary');
          setImageAvailable(false);
          setLoading(false);
          return;
        }
        
        if (viewerRef.current) {
          viewerRef.current.remove();
        }
        
        // Assicuriamoci che il container sia valido
        if (!viewerContainerRef.current) {
          console.error('Container HTML non disponibile');
          setImageAvailable(false);
          setLoading(false);
          return;
        }

        // Crea un nuovo visualizzatore Mapillary
        const viewer = new Mapillary.Viewer({
          accessToken: 'MLY|6894255755044431|e0c0aabaaa66efe018d8d1df5b9fdad1', // Token pubblico di test Mapillary
          container: viewerContainerRef.current as HTMLElement,
          component: {
            cover: false,
            direction: true,
            zoom: true,
            popup: true,
          },
        });
        
        viewerRef.current = viewer;
        
        // Cerca immagini Mapillary vicine alle coordinate specificate
        viewer.setCenter([longitude, latitude]);
        
        // Gestisce gli eventi del visualizzatore
        // Utilizziamo un evento generico supportato
        viewer.on('dataloaded', (event: any) => {
          console.log('Dati caricati', event);
        });
        
        // Verifica se ci sono immagini disponibili per questa posizione
        const checkImageAvailability = async () => {
          try {
            // Utilizza Mapillary API per verificare se ci sono immagini disponibili
            const response = await fetch(
              `https://graph.mapillary.com/images?access_token=MLY|6894255755044431|e0c0aabaaa66efe018d8d1df5b9fdad1&fields=id&limit=1&closeto=${longitude},${latitude}`
            );
            
            const data = await response.json();
            
            if (data && data.data && data.data.length > 0) {
              setImageAvailable(true);
              
              // Carica l'immagine più vicina
              const nearestImageId = data.data[0].id;
              try {
                await viewer.moveTo(nearestImageId);
              } catch (err) {
                console.error('Errore nel caricamento dell\'immagine', err);
                setImageAvailable(false);
              }
            } else {
              setImageAvailable(false);
            }
          } catch (error) {
            console.error('Errore nel verificare la disponibilità di immagini', error);
            setImageAvailable(false);
          } finally {
            setLoading(false);
          }
        };
        
        // Verifica la disponibilità delle immagini
        checkImageAvailability();
        
      } catch (error) {
        console.error('Errore nell\'inizializzazione di Mapillary', error);
        setImageAvailable(false);
        setLoading(false);
      }
    };
    
    initMapillary();
    
  }, [latitude, longitude]);

  // Gestisce il toggle della modalità fullscreen
  const toggleFullscreen = () => {
    if (!viewerContainerRef.current) return;
    
    if (!document.fullscreenElement) {
      viewerContainerRef.current.requestFullscreen().catch(err => {
        toast({
          title: "Errore",
          description: `Impossibile attivare la modalità a schermo intero: ${err.message}`,
          variant: "destructive",
        });
      });
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  // Gestisce lo zoom in e out
  const handleZoom = (zoomIn: boolean) => {
    if (!viewerRef.current) return;
    
    try {
      if (zoomIn) {
        viewerRef.current.zoom.zoomIn();
      } else {
        viewerRef.current.zoom.zoomOut();
      }
    } catch (error) {
      console.error('Errore durante lo zoom', error);
    }
  };

  // Gestisce la rotazione della vista
  const handleRotate = () => {
    if (!viewerRef.current) return;
    
    try {
      // Ruota di 90 gradi
      const currentBearing = viewerRef.current.getBearing();
      viewerRef.current.setBearing(currentBearing + 90);
    } catch (error) {
      console.error('Errore durante la rotazione', error);
    }
  };

  return (
    <div 
      className={`relative w-full rounded-lg overflow-hidden border border-neutral-200 ${className}`} 
      style={{ height: `${fullscreen ? '100vh' : `${height}px`}` }}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 z-10">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
            <p className="text-sm text-neutral-600">Caricamento Vista Stradale...</p>
          </div>
        </div>
      )}
      
      {!loading && imageAvailable === false && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 z-10">
          <div className="flex flex-col items-center text-center px-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-neutral-200 flex items-center justify-center mb-3">
              <MapPin className="h-6 w-6 sm:h-8 sm:w-8 text-neutral-500" />
            </div>
            <h3 className="text-base sm:text-lg font-medium text-neutral-800 mb-1">Vista Stradale non disponibile</h3>
            <p className="text-xs sm:text-sm text-neutral-600 max-w-md">
              Non sono disponibili immagini Street View per questa posizione. Prova a esplorare altre zone vicine.
            </p>
          </div>
        </div>
      )}
      
      <div 
        ref={viewerContainerRef} 
        className="w-full h-full touch-manipulation" 
        style={{ visibility: !loading && imageAvailable ? 'visible' : 'hidden' }}
      />
      
      {!loading && imageAvailable && (
        <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 flex flex-wrap justify-end space-x-1.5 sm:space-x-2 z-20">
          <Button
            variant="secondary"
            size="icon"
            className="bg-white/90 backdrop-blur-sm shadow-md hover:bg-white h-8 w-8 sm:h-9 sm:w-9"
            onClick={() => handleZoom(true)}
            aria-label="Zoom in"
          >
            <ZoomIn className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="bg-white/90 backdrop-blur-sm shadow-md hover:bg-white h-8 w-8 sm:h-9 sm:w-9"
            onClick={() => handleZoom(false)}
            aria-label="Zoom out"
          >
            <ZoomOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="bg-white/90 backdrop-blur-sm shadow-md hover:bg-white h-8 w-8 sm:h-9 sm:w-9"
            onClick={handleRotate}
            aria-label="Ruota vista"
          >
            <RotateCw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="bg-white/90 backdrop-blur-sm shadow-md hover:bg-white h-8 w-8 sm:h-9 sm:w-9"
            onClick={toggleFullscreen}
            aria-label="Schermo intero"
          >
            <Maximize className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}