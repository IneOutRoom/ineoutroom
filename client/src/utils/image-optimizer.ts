/**
 * Utility per l'ottimizzazione delle immagini
 * 
 * Gestisce:
 * - Conversione automatica di percorsi a WebP/AVIF
 * - Generazione di URL per placeholder
 * - Controllo dimensioni massime
 * - Gestione CDN (se configurata)
 */

// Configurazione
const config = {
  // Percorso di base per le immagini su CDN (se presente)
  cdnBasePath: process.env.NODE_ENV === 'production' ? 'https://cdn.ineoutroom.eu/images' : '',
  
  // Dimensioni predefinite per vari tipi di immagini
  sizes: {
    thumbnail: { width: 240, height: 160 },
    card: { width: 385, height: 256 },
    gallery: { width: 800, height: 600 },
    hero: { width: 1600, height: 900 },
    avatar: { width: 64, height: 64 },
    avatarLarge: { width: 128, height: 128 },
  },
  
  // Placeholder per vari tipi
  placeholders: {
    property: '/images/placeholder-property.webp',
    host: '/images/host-placeholder.webp',
    user: '/images/host-placeholder.webp',
    generic: '/images/placeholder-property.webp',
  }
};

/**
 * Converte un URL di immagine in un URL ottimizzato per WebP
 * Se l'immagine è ospitata su CDN, utilizza i parametri di query per ottimizzazione
 */
export function getOptimizedImageUrl(url: string, options?: {
  width?: number;
  height?: number;
  format?: 'webp' | 'avif' | 'original';
  quality?: number;
}): string {
  if (!url) return config.placeholders.generic;
  
  // Gestisci parametri predefiniti
  const format = options?.format || 'webp';
  const quality = options?.quality || 85;
  
  // Se è un URL data: o blob:, non modificarlo
  if (url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }
  
  // Se è un URL esterno (non CDN e non locale)
  if (url.startsWith('http') && 
      !url.includes('ineoutroom.eu') && 
      !url.includes('localhost')) {
    return url;
  }
  
  // Se è un URL relativo locale
  if (url.startsWith('/')) {
    // Se stiamo richiedendo la versione originale, restituisci l'URL originale
    if (format === 'original') {
      return url;
    }
    
    // Altrimenti, converti il formato
    if (url.match(/\.(jpe?g|png|gif)$/i)) {
      return url.replace(/\.(jpe?g|png|gif)$/i, `.${format}`);
    }
    
    return url;
  }
  
  // Se è un URL CDN
  if (url.includes('cdn.ineoutroom.eu')) {
    // Aggiungi parametri per CDN
    const params = new URLSearchParams();
    if (options?.width) params.append('w', options.width.toString());
    if (options?.height) params.append('h', options.height.toString());
    params.append('fm', format);
    params.append('q', quality.toString());
    
    // Aggiungi parametri a URL esistente o crea nuovo URL
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}${params.toString()}`;
  }
  
  // Per tutti gli altri URL, restituisci l'originale
  return url;
}

/**
 * Restituisce l'URL di un placeholder per un tipo specifico
 */
export function getPlaceholderUrl(type: 'property' | 'host' | 'user' | 'generic' = 'generic'): string {
  return config.placeholders[type] || config.placeholders.generic;
}

/**
 * Controlla se un URL è probabilmente un'immagine valida
 */
export function isValidImageUrl(url: string): boolean {
  if (!url) return false;
  
  // Controlla URL di dati/blob
  if (url.startsWith('data:image/') || url.startsWith('blob:')) {
    return true;
  }
  
  // Controlla estensioni immagine comuni
  return !!url.match(/\.(jpe?g|png|gif|webp|avif|svg)$/i);
}

/**
 * Ottiene le dimensioni per un tipo di immagine predefinito
 */
export function getImageDimensions(type: keyof typeof config.sizes): { width: number, height: number } {
  return config.sizes[type] || { width: 0, height: 0 };
}

/**
 * Genera il markup HTML completo per un tag picture che supporta WebP e AVIF
 */
export function generatePictureHtml(
  url: string, 
  alt: string,
  options?: {
    width?: number;
    height?: number;
    className?: string;
    loading?: 'lazy' | 'eager';
  }
): string {
  const webpUrl = getOptimizedImageUrl(url, { ...options, format: 'webp' });
  const avifUrl = getOptimizedImageUrl(url, { ...options, format: 'avif' });
  const originalUrl = getOptimizedImageUrl(url, { ...options, format: 'original' });
  
  const width = options?.width ? `width="${options.width}"` : '';
  const height = options?.height ? `height="${options.height}"` : '';
  const className = options?.className ? `class="${options.className}"` : '';
  const loading = options?.loading || 'lazy';
  
  return `
    <picture>
      <source srcset="${avifUrl}" type="image/avif">
      <source srcset="${webpUrl}" type="image/webp">
      <img 
        src="${originalUrl}" 
        alt="${alt}"
        ${width}
        ${height}
        ${className}
        loading="${loading}"
        decoding="async"
      >
    </picture>
  `;
}