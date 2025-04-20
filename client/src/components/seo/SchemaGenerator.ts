/**
 * Utility per generare dati strutturati JSON-LD schema.org
 * Utilizzato per migliorare la comprensione dei contenuti da parte dei motori di ricerca
 */

/**
 * Genera un oggetto Schema.org per un annuncio immobiliare
 * 
 * @param property Oggetto con i dati dell'annuncio immobiliare
 * @returns Oggetto JSON-LD compatibile con schema.org
 */
export function generateRentalSchema(property: {
  id: number;
  title: string;
  description: string;
  price: number;
  availableFrom?: string;
  address: string;
  city: string;
  photos?: string[];
  features?: string[];
  squareMeters?: number;
  propertyType: string;
  latitude?: number;
  longitude?: number;
  bedrooms?: number;
  bathrooms?: number;
}) {
  const mainImage = property.photos && property.photos.length > 0 
    ? property.photos[0] 
    : null;
  
  // Determina il tipo di alloggio in base alla proprietà
  const accommodationType = getAccommodationType(property.propertyType);
  
  // Genera le coordinate geo se disponibili
  const hasGeo = property.latitude && property.longitude;
  
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "name": property.title,
    "description": property.description,
    "url": `https://ineoutroom.eu/properties/${property.id}`,
    "datePosted": new Date().toISOString(),
    ...(property.availableFrom && { "availabilityStarts": property.availableFrom }),
    "offers": {
      "@type": "Offer",
      "price": property.price,
      "priceCurrency": "EUR",
      "availability": "https://schema.org/InStock"
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": property.city,
      "streetAddress": property.address
    },
    ...(hasGeo && {
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": property.latitude,
        "longitude": property.longitude
      }
    }),
    "accommodationCategory": accommodationType,
    ...(mainImage && { "image": mainImage }),
    ...(property.squareMeters && { "floorSize": {
      "@type": "QuantitativeValue",
      "value": property.squareMeters,
      "unitCode": "MTK"
    }}),
    ...(property.bedrooms && { "numberOfBedrooms": property.bedrooms }),
    ...(property.bathrooms && { "numberOfBathrooms": property.bathrooms }),
    "potentialAction": {
      "@type": "ViewAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `https://ineoutroom.eu/properties/${property.id}`
      }
    }
  };
}

/**
 * Genera un oggetto Schema.org per una pagina generica
 * 
 * @param data Informazioni sulla pagina
 * @returns Oggetto JSON-LD per WebPage
 */
export function generateWebPageSchema(data: {
  title: string;
  description: string;
  url: string;
  image?: string;
  lastUpdated?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": data.title,
    "description": data.description,
    "url": data.url,
    ...(data.image && { "image": data.image }),
    ...(data.lastUpdated && { "dateModified": data.lastUpdated }),
    "isPartOf": {
      "@type": "WebSite",
      "name": "In&Out Room",
      "url": "https://ineoutroom.eu"
    }
  };
}

/**
 * Genera schema.org Organization per il footer o la homepage
 * 
 * @returns Oggetto JSON-LD per Organization
 */
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "In&Out Room",
    "url": "https://ineoutroom.eu",
    "logo": "https://ineoutroom.eu/logo.png",
    "sameAs": [
      "https://www.facebook.com/ineoutroom",
      "https://www.instagram.com/ineoutroom",
      "https://twitter.com/ineoutroom"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "email": "info@ineoutroom.eu",
      "availableLanguage": ["Italian", "English"]
    }
  };
}

/**
 * Genera schema.org BreadcrumbList per la navigazione del sito
 * 
 * @param items Array di oggetti {name, url} che rappresentano il percorso di navigazione
 * @returns Oggetto JSON-LD per BreadcrumbList
 */
export function generateBreadcrumbSchema(items: Array<{name: string, url: string}>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
}

/**
 * Genera Schema.org per una pagina di risultati di ricerca
 * Migliora la comprensione dei risultati da parte dei motori di ricerca
 * 
 * @param data Dati della ricerca e dei risultati
 * @returns Oggetto JSON-LD per SearchResultsPage
 */
export function generateSearchResultsSchema(data: {
  query: {
    city?: string;
    propertyType?: string;
    minPrice?: number;
    maxPrice?: number;
    isFurnished?: boolean;
    allowsPets?: boolean;
    internetIncluded?: boolean;
  };
  results: Array<{
    id: number;
    title: string;
    price: number;
    city: string;
    propertyType: string;
    url: string;
  }>;
}) {
  // Crea una descrizione testuale della query di ricerca
  const queryDescriptionParts = [];
  if (data.query.city) queryDescriptionParts.push(`città: ${data.query.city}`);
  if (data.query.propertyType) queryDescriptionParts.push(`tipo: ${data.query.propertyType}`);
  if (data.query.minPrice) queryDescriptionParts.push(`prezzo min: €${data.query.minPrice}`);
  if (data.query.maxPrice) queryDescriptionParts.push(`prezzo max: €${data.query.maxPrice}`);
  if (data.query.isFurnished) queryDescriptionParts.push('arredato');
  if (data.query.allowsPets) queryDescriptionParts.push('animali ammessi');
  if (data.query.internetIncluded) queryDescriptionParts.push('internet incluso');
  
  const queryDescription = queryDescriptionParts.length > 0
    ? `Ricerca per ${queryDescriptionParts.join(', ')}`
    : 'Ricerca di tutti gli alloggi disponibili';
  
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `Risultati di ricerca alloggi${data.query.city ? ` a ${data.query.city}` : ''}`,
    "description": queryDescription,
    "url": "https://ineoutroom.eu/search",
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": data.results.map((property, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "RealEstateListing",
          "name": property.title,
          "url": property.url,
          "offers": {
            "@type": "Offer",
            "price": property.price,
            "priceCurrency": "EUR"
          },
          "accommodationCategory": getAccommodationType(property.propertyType),
          "address": {
            "@type": "PostalAddress",
            "addressLocality": property.city
          }
        }
      }))
    }
  };
}

function getAccommodationType(propertyType: string): string {
  switch (propertyType) {
    case 'stanza_singola':
      return 'Room';
    case 'stanza_doppia':
      return 'Room';
    case 'monolocale':
      return 'Apartment';
    case 'bilocale':
      return 'Apartment';
    default:
      return 'Accommodation';
  }
}