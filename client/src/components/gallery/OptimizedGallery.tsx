import React, { useState } from 'react';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X, ZoomIn, Share2, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface OptimizedGalleryProps {
  images: string[];
  alt?: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'auto';
  allowFullscreen?: boolean;
  enableSharing?: boolean;
  enableDownload?: boolean;
}

/**
 * Galleria di immagini ottimizzata con:
 * - Supporto per formati moderni (WebP/AVIF)
 * - Lazy loading
 * - Placeholder a bassa risoluzione
 * - Modalità fullscreen
 * - Navigazione touch-friendly
 */
export function OptimizedGallery({
  images,
  alt = 'Immagine galleria',
  className = '',
  aspectRatio = 'video',  // 16:9 di default
  allowFullscreen = true,
  enableSharing = true,
  enableDownload = true
}: OptimizedGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const { toast } = useToast();

  // Se non ci sono immagini, mostra un placeholder
  if (!images || images.length === 0) {
    return (
      <div className={`overflow-hidden relative ${getAspectRatioClass(aspectRatio)} ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <p className="text-gray-400">Nessuna immagine disponibile</p>
        </div>
      </div>
    );
  }

  // Funzione per navigare nella galleria
  const navigate = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setActiveIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
    } else {
      setActiveIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
    }
  };

  // Condividi immagine
  const shareImage = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: alt,
          text: 'Guarda questa proprietà su In&Out',
          url: images[activeIndex],
        });
      } else {
        // Fallback: copia URL negli appunti
        await navigator.clipboard.writeText(images[activeIndex]);
        toast({
          title: 'URL copiato',
          description: 'URL dell\'immagine copiato negli appunti',
        });
      }
    } catch (error) {
      console.error('Errore durante la condivisione:', error);
    }
  };

  // Download immagine
  const downloadImage = () => {
    // Crea un link temporaneo e simula il click
    const link = document.createElement('a');
    link.href = images[activeIndex];
    link.download = `ineoutroom-image-${activeIndex + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calcola la classe per l'aspect ratio
  function getAspectRatioClass(ratio: string) {
    switch (ratio) {
      case 'square':
        return 'aspect-square';
      case 'video':
        return 'aspect-video';
      case 'portrait':
        return 'aspect-[3/4]';
      case 'auto':
      default:
        return '';
    }
  }

  // Componente principale (vista normale)
  const galleryContent = (
    <div className={`overflow-hidden relative ${getAspectRatioClass(aspectRatio)} ${className}`}>
      {/* Immagine attiva */}
      <OptimizedImage
        src={images[activeIndex]}
        alt={`${alt} ${activeIndex + 1}`}
        className="w-full h-full object-cover transition-opacity duration-300"
        objectFit="cover"
        lazy={activeIndex !== 0} // Solo la prima immagine caricata immediatamente
      />

      {/* Controlli di navigazione (solo se ci sono più immagini) */}
      {images.length > 1 && (
        <>
          <Button
            size="icon"
            variant="ghost"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 rounded-full p-2 shadow-md"
            onClick={() => navigate('prev')}
            aria-label="Immagine precedente"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 rounded-full p-2 shadow-md"
            onClick={() => navigate('next')}
            aria-label="Immagine successiva"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
          
          {/* Indicatore posizione */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1">
            {images.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full ${
                  index === activeIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/60'
                } transition-all duration-300`}
                onClick={() => setActiveIndex(index)}
                role="button"
                tabIndex={0}
                aria-label={`Vai all'immagine ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Controlli di azione */}
      <div className="absolute top-3 right-3 flex space-x-2">
        {allowFullscreen && (
          <Button
            size="icon"
            variant="ghost"
            className="bg-white/80 hover:bg-white/90 rounded-full p-2 shadow-md"
            onClick={() => setFullscreen(true)}
            aria-label="Visualizza a schermo intero"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        )}
        
        {enableSharing && (
          <Button
            size="icon"
            variant="ghost"
            className="bg-white/80 hover:bg-white/90 rounded-full p-2 shadow-md"
            onClick={shareImage}
            aria-label="Condividi immagine"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        )}
        
        {enableDownload && (
          <Button
            size="icon"
            variant="ghost"
            className="bg-white/80 hover:bg-white/90 rounded-full p-2 shadow-md"
            onClick={downloadImage}
            aria-label="Scarica immagine"
          >
            <Download className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );

  // Modalità fullscreen (popup)
  const fullscreenDialog = (
    <Dialog open={fullscreen} onOpenChange={setFullscreen}>
      <DialogContent className="max-w-full max-h-full w-[95vw] h-[95vh] p-0 m-4 border-none bg-transparent shadow-none">
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm -z-10" />
          
          <OptimizedImage
            src={images[activeIndex]}
            alt={`${alt} ${activeIndex + 1}`}
            className="max-w-full max-h-full object-contain"
            objectFit="contain"
            lazy={false}
          />
          
          {/* Controlli di navigazione */}
          {images.length > 1 && (
            <>
              <Button
                size="icon"
                variant="ghost"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 shadow-md"
                onClick={() => navigate('prev')}
                aria-label="Immagine precedente"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 shadow-md"
                onClick={() => navigate('next')}
                aria-label="Immagine successiva"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}
          
          {/* Pulsante di chiusura */}
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 shadow-md"
            onClick={() => setFullscreen(false)}
            aria-label="Chiudi visualizzazione a schermo intero"
          >
            <X className="h-5 w-5" />
          </Button>
          
          {/* Indicatore posizione */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
            {images.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full ${
                  index === activeIndex ? 'w-6 bg-white' : 'w-2 bg-white/60'
                } transition-all duration-300`}
                onClick={() => setActiveIndex(index)}
                role="button"
                tabIndex={0}
                aria-label={`Vai all'immagine ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      {galleryContent}
      {allowFullscreen && fullscreenDialog}
    </>
  );
}