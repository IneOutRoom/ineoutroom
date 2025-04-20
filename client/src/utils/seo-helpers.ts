/**
 * Utility per supportare l'ottimizzazione SEO del sito
 */

/**
 * Genera un testo descrittivo per l'attributo alt di un'immagine
 * 
 * @param propertyInfo Informazioni sulla proprietà
 * @param imageIndex Indice dell'immagine nella galleria
 * @returns Testo descrittivo per l'attributo alt
 */
export function generateImageAlt(
  propertyInfo: {
    title: string;
    propertyType?: string;
    city?: string;
    zone?: string | null;
  },
  imageIndex: number = 0
): string {
  const { title, propertyType, city, zone } = propertyInfo;
  const propertyTypeText = translatePropertyType(propertyType || '');
  const locationText = zone ? `${zone}, ${city}` : city;
  
  // Genera descrizioni diverse basate sull'indice per evitare duplicati
  switch (imageIndex) {
    case 0:
      return `${title} - ${propertyTypeText}${locationText ? ` a ${locationText}` : ''}`;
    case 1:
      return `Interni di ${title} - ${propertyTypeText}${locationText ? ` a ${locationText}` : ''}`;
    case 2:
      return `Vista da ${title} - ${propertyTypeText}${locationText ? ` situato a ${locationText}` : ''}`;
    default:
      return `${title} - Immagine ${imageIndex + 1}${locationText ? ` (${locationText})` : ''}`;
  }
}

/**
 * Crea un nome file SEO-friendly basato sul titolo della proprietà
 * 
 * @param title Titolo della proprietà
 * @returns Nome file SEO-friendly
 */
export function generateSeoFilename(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/gi, '') // Rimuovi caratteri speciali
    .replace(/\s+/g, '-')     // Sostituisci spazi con trattini
    .substring(0, 50);        // Limita lunghezza
}

/**
 * Genera un titolo SEO ottimizzato per la pagina della proprietà
 * 
 * @param property Informazioni sulla proprietà
 * @returns Titolo SEO ottimizzato
 */
export function generatePropertyTitle(property: {
  title: string;
  propertyType?: string;
  city?: string;
  price?: number;
}): string {
  const { title, propertyType, city, price } = property;
  const propertyTypeText = translatePropertyType(propertyType || '');
  
  // Aggiungi informazioni rilevanti al titolo
  let seoTitle = title;
  
  if (propertyTypeText) {
    seoTitle += ` | ${propertyTypeText}`;
  }
  
  if (city) {
    seoTitle += ` a ${city}`;
  }
  
  if (price) {
    seoTitle += ` | ${price}€`;
  }
  
  return seoTitle;
}

/**
 * Genera una meta descrizione ottimizzata per la pagina della proprietà
 * 
 * @param property Informazioni sulla proprietà
 * @returns Meta descrizione ottimizzata
 */
export function generatePropertyDescription(property: {
  title: string;
  description?: string;
  propertyType?: string;
  city?: string;
  zone?: string | null;
  squareMeters?: number;
  bedrooms?: number;
  price?: number;
}): string {
  const { title, description, propertyType, city, zone, squareMeters, bedrooms, price } = property;
  const propertyTypeText = translatePropertyType(propertyType || '');
  const locationText = zone ? `${zone}, ${city}` : city;
  
  // Crea una descrizione sintetica se quella originale è troppo lunga
  let metaDescription = '';
  
  if (propertyTypeText) {
    metaDescription += `${propertyTypeText} `;
  }
  
  metaDescription += `"${title}" `;
  
  if (locationText) {
    metaDescription += `a ${locationText}. `;
  }
  
  // Aggiungi dettagli rilevanti
  const details = [];
  
  if (squareMeters) {
    details.push(`${squareMeters} mq`);
  }
  
  if (bedrooms) {
    details.push(`${bedrooms} ${bedrooms === 1 ? 'camera' : 'camere'}`);
  }
  
  if (price) {
    details.push(`${price}€ al mese`);
  }
  
  if (details.length > 0) {
    metaDescription += `${details.join(', ')}. `;
  }
  
  // Aggiungi parte della descrizione originale se c'è spazio
  if (description) {
    const maxRemainingLength = 155 - metaDescription.length;
    
    if (maxRemainingLength > 30) {
      // Trova la fine di una frase o tronca
      const truncatedDesc = description.substring(0, maxRemainingLength);
      const lastSentenceEnd = Math.max(
        truncatedDesc.lastIndexOf('.'),
        truncatedDesc.lastIndexOf('!'),
        truncatedDesc.lastIndexOf('?')
      );
      
      const cleanDesc = lastSentenceEnd > 30
        ? truncatedDesc.substring(0, lastSentenceEnd + 1)
        : truncatedDesc + '...';
      
      metaDescription += cleanDesc;
    }
  }
  
  return metaDescription.trim();
}

/**
 * Genera un URL canonico per una pagina
 * 
 * @param path Path relativo della pagina
 * @param params Eventuali parametri query da includere 
 * @returns URL canonico completo
 */
export function generateCanonicalUrl(path: string, params?: Record<string, string | number>): string {
  let url = `https://ineoutroom.eu${path.startsWith('/') ? path : `/${path}`}`;
  
  // Aggiungi parametri query se necessario
  if (params && Object.keys(params).length > 0) {
    const queryParams = Object.entries(params)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
    
    url += `?${queryParams}`;
  }
  
  return url;
}

/**
 * Traduce il tipo di proprietà interno in una descrizione leggibile
 * 
 * @param propertyType Tipo di proprietà interno
 * @returns Descrizione leggibile del tipo di proprietà
 */
function translatePropertyType(propertyType: string): string {
  switch (propertyType) {
    case 'stanza_singola':
      return 'Stanza singola';
    case 'stanza_doppia':
      return 'Stanza doppia';
    case 'monolocale':
      return 'Monolocale';
    case 'bilocale':
      return 'Bilocale';
    case 'appartamento':
      return 'Appartamento';
    case 'villa':
      return 'Villa';
    case 'attico':
      return 'Attico';
    default:
      return propertyType || 'Alloggio';
  }
}