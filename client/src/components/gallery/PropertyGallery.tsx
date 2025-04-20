import React, { useState } from 'react';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Grid3X3, XCircle } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { getPlaceholderUrl } from '@/utils/image-optimizer';

interface PropertyGalleryProps {
  images: string[];
  alt: string;
  className?: string;
}

/**
 * Galleria di immagini per proprietà immobiliari ottimizzata per:
 * - Caricamento progressivo (lazy loading)
 * - Placeholder a bassa risoluzione durante il caricamento
 * - Supporto per formati moderni (WebP/AVIF)
 * - Modalità fullscreen
 * - Navigazione touch-friendly
 * - Layout responsive
 */
export function PropertyGallery({ images, alt, className = '' }: PropertyGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [gridViewOpen, setGridViewOpen] = useState(false);
  
  // Se non ci sono immagini, mostra un placeholder
  const validImages = images?.filter(img => !!img) || [];
  
  if (validImages.length === 0) {
    return (
      <div className={`relative rounded-lg overflow-hidden aspect-video ${className}`}>
        <OptimizedImage
          src={getPlaceholderUrl('property')}
          alt={alt}
          className="w-full h-full object-cover"
          objectFit="cover"
          blur={false}
        />
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <p className="text-white font-medium">Nessuna immagine disponibile</p>
        </div>
      </div>
    );
  }
  
  // Se c'è una sola immagine, mostra solo quella
  if (validImages.length === 1) {
    return (
      <div className={`relative rounded-lg overflow-hidden aspect-video ${className}`}>
        <OptimizedImage
          src={validImages[0]}
          alt={alt}
          className="w-full h-full object-cover"
          objectFit="cover"
          priority={true}
          blur={true}
          placeholderSrc={getPlaceholderUrl('property')}
        />
      </div>
    );
  }
  
  const navigate = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setActiveIndex(prev => (prev === 0 ? validImages.length - 1 : prev - 1));
    } else {
      setActiveIndex(prev => (prev === validImages.length - 1 ? 0 : prev + 1));
    }
  };
  
  // Componente di navigazione
  const NavigationArrows = () => (
    <>
      <Button
        size="icon"
        variant="ghost"
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white/90 rounded-full p-2 shadow-md"
        onClick={() => navigate('prev')}
        aria-label="Immagine precedente"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white/90 rounded-full p-2 shadow-md"
        onClick={() => navigate('next')}
        aria-label="Immagine successiva"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </>
  );
  
  // Componente di indicatori
  const Indicators = () => (
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1">
      {validImages.map((_, index) => (
        <div
          key={index}
          className={`h-1.5 rounded-full transition-all duration-200 cursor-pointer ${
            index === activeIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/60 hover:bg-white/80'
          }`}
          onClick={() => setActiveIndex(index)}
          role="button"
          tabIndex={0}
          aria-label={`Vai all'immagine ${index + 1}`}
        />
      ))}
    </div>
  );
  
  // Vista principale
  const MainGalleryView = () => (
    <div className={`relative rounded-lg overflow-hidden aspect-video ${className}`}>
      <OptimizedImage
        src={validImages[activeIndex]}
        alt={`${alt} ${activeIndex + 1}`}
        className="w-full h-full object-cover transition-opacity duration-300"
        objectFit="cover"
        priority={activeIndex === 0}
        lazy={activeIndex !== 0}
        blur={true}
        placeholderSrc={getPlaceholderUrl('property')}
      />
      
      <NavigationArrows />
      <Indicators />
      
      {/* Controlli aggiuntivi */}
      <div className="absolute top-3 right-3 flex space-x-2">
        <Button
          size="sm"
          variant="secondary"
          className="bg-white/70 hover:bg-white/90 shadow-md rounded-md"
          onClick={() => setGridViewOpen(true)}
        >
          <Grid3X3 className="h-4 w-4 mr-1" /> 
          Tutte le foto ({validImages.length})
        </Button>
      </div>
    </div>
  );
  
  // Vista griglia
  const GridGalleryView = () => (
    <Dialog open={gridViewOpen} onOpenChange={setGridViewOpen}>
      <DialogContent className="max-w-5xl p-4 sm:p-6 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg sm:text-xl font-semibold truncate">Tutte le foto ({validImages.length})</h3>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setGridViewOpen(false)}
          >
            <XCircle className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 pr-0 overflow-y-auto max-h-[70vh] pb-4 scrollbar-thin scrollbar-thumb-neutral-300">
          {validImages.map((img, index) => (
            <div 
              key={index} 
              className="relative aspect-video rounded-md overflow-hidden cursor-pointer"
              onClick={() => {
                setActiveIndex(index);
                setGridViewOpen(false);
                setFullscreenOpen(true);
              }}
            >
              <OptimizedImage
                src={img}
                alt={`${alt} ${index + 1}`}
                className="w-full h-full object-cover"
                objectFit="cover"
                lazy={true}
                blur={true}
                placeholderSrc={getPlaceholderUrl('property')}
              />
              
              <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors" />
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
  
  // Vista fullscreen
  const FullscreenGalleryView = () => (
    <Dialog open={fullscreenOpen} onOpenChange={setFullscreenOpen}>
      <DialogContent className="max-w-full max-h-full w-[95vw] h-[95vh] p-0 m-4 border-none bg-transparent shadow-none">
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm -z-10" />
          
          <OptimizedImage
            src={validImages[activeIndex]}
            alt={`${alt} ${activeIndex + 1}`}
            className="max-w-full max-h-full object-contain"
            objectFit="contain"
            lazy={false}
            blur={true}
            placeholderSrc={getPlaceholderUrl('property')}
          />
          
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
          
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 shadow-md"
            onClick={() => setFullscreenOpen(false)}
            aria-label="Chiudi"
          >
            <XCircle className="h-5 w-5" />
          </Button>
          
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
            {validImages.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  index === activeIndex ? 'w-6 bg-white' : 'w-2 bg-white/60 hover:bg-white/80'
                }`}
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
      <div 
        className={`cursor-pointer ${className}`}
        onClick={() => setFullscreenOpen(true)}
      >
        <MainGalleryView />
      </div>
      <GridGalleryView />
      <FullscreenGalleryView />
    </>
  );
}