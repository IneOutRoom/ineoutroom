import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  lazy?: boolean;
  priority?: boolean;
  blur?: boolean;
  placeholderSrc?: string;
}

/**
 * Componente di immagine ottimizzato che:
 * 1. Supporta formati moderni (WebP/AVIF) tramite picture element
 * 2. Implementa il lazy loading quando non è prioritario
 * 3. Supporta placeholder e caricamento progressivo
 * 4. Gestisce le dimensioni per evitare CLS (Cumulative Layout Shift)
 * 5. Ottimizza SEO con attributi alt obbligatori
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  objectFit = 'cover',
  lazy = true,
  priority = false,
  blur = true,
  placeholderSrc
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  
  // Se l'immagine è priorità, non usare lazy loading
  const shouldLazyLoad = lazy && !priority;
  
  // Genera URL per WebP e AVIF automaticamente
  const getWebPUrl = (url: string) => {
    // Se è già un URL webp, lascialo invariato
    if (url.endsWith('.webp')) return url;
    
    // Se è un URL esterno con parametri query, è difficile modificarlo in sicurezza
    if (url.includes('?')) return url;
    
    // Altrimenti, cerca la versione webp
    return url.replace(/\.(jpe?g|png)$/i, '.webp');
  };
  
  const getAvifUrl = (url: string) => {
    // Se è già un URL avif, lascialo invariato
    if (url.endsWith('.avif')) return url;
    
    // Se è un URL esterno con parametri query, è difficile modificarlo in sicurezza
    if (url.includes('?')) return url;
    
    // Altrimenti, cerca la versione avif
    return url.replace(/\.(jpe?g|png)$/i, '.avif');
  };
  
  // Genera URL per il placeholder
  const getPlaceholderUrl = (url: string) => {
    if (placeholderSrc) return placeholderSrc;
    
    // Se è un URL esterno, usa un placeholder generico
    if (url.startsWith('http')) {
      return '/images/placeholder-property.webp';
    }
    
    // Altrimenti, cerca una versione -placeholder
    return url.replace(/\.(jpe?g|png|webp)$/i, '-placeholder.webp');
  };
  
  // Determina se è un'immagine di fallback
  const isFallbackImage = error || !src;
  
  // Genera l'URL di fallback
  const fallbackUrl = isFallbackImage 
    ? '/images/placeholder-property.webp' 
    : src;
  
  const webpUrl = isFallbackImage 
    ? '/images/placeholder-property.webp' 
    : getWebPUrl(src);
  
  const avifUrl = isFallbackImage 
    ? '/images/placeholder-property.webp' 
    : getAvifUrl(src);
  
  const blurUrl = blur ? getPlaceholderUrl(src) : undefined;
  
  // Event handlers
  const handleLoad = () => {
    setIsLoaded(true);
  };
  
  const handleError = () => {
    setError(true);
    console.warn(`Errore nel caricamento dell'immagine: ${src}`);
  };
  
  // Effetto per gestire il precaricamento se l'immagine è prioritaria
  useEffect(() => {
    if (priority && !isLoaded) {
      const img = new Image();
      img.src = src;
      img.onload = handleLoad;
      img.onerror = handleError;
    }
  }, [priority, src, isLoaded]);
  
  return (
    <div 
      className={cn(
        'relative overflow-hidden', 
        objectFit === 'contain' ? 'flex items-center justify-center' : '',
        className
      )}
      style={{ 
        width: width ? `${width}px` : '100%',
        height: height ? `${height}px` : '100%'
      }}
    >
      {/* Placeholder durante il caricamento */}
      {blur && blurUrl && !isLoaded && !error && (
        <img
          src={blurUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-sm scale-110 transition-opacity duration-300"
          aria-hidden="true"
        />
      )}
      
      {/* Immagine principale con supporto per formati moderni */}
      <picture>
        {/* AVIF */}
        <source 
          srcSet={avifUrl} 
          type="image/avif" 
        />
        
        {/* WebP */}
        <source 
          srcSet={webpUrl} 
          type="image/webp" 
        />
        
        {/* Fallback */}
        <img
          src={fallbackUrl}
          alt={alt}
          width={width}
          height={height}
          loading={shouldLazyLoad ? 'lazy' : 'eager'}
          decoding={priority ? 'sync' : 'async'}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'w-full h-full transition-opacity duration-500',
            objectFit === 'cover' && 'object-cover',
            objectFit === 'contain' && 'object-contain',
            objectFit === 'fill' && 'object-fill',
            objectFit === 'none' && 'object-none',
            objectFit === 'scale-down' && 'object-scale-down',
            !isLoaded && blur && blurUrl ? 'opacity-0' : 'opacity-100'
          )}
        />
      </picture>
    </div>
  );
}