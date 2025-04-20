import Head from 'next/head';

/**
 * Componente SEO per gestire meta tag e OpenGraph
 * 
 * @param {Object} props - Proprietà del componente
 * @param {string} props.title - Titolo della pagina
 * @param {string} props.description - Descrizione della pagina
 * @param {string} props.keywords - Parole chiave separate da virgola
 * @param {string} props.ogImage - URL immagine OpenGraph
 * @param {string} props.ogType - Tipo di contenuto OpenGraph
 * @param {string} props.canonical - URL canonico
 * @param {string} props.locale - Lingua della pagina (default: it_IT)
 * @param {Object|Array} props.schemaData - Dati strutturati JSON-LD (oggetto singolo)
 * @param {Array} props.jsonLd - Array di dati strutturati JSON-LD (multipli schemi)
 * @param {boolean} props.noindex - Impedisce l'indicizzazione della pagina
 */
export default function SEO({
  title = 'In&Out - Trova stanze e alloggi in Europa',
  description = 'Il modo più semplice per trovare la tua prossima casa in Europa. Stanze, appartamenti e soluzioni per ogni esigenza.',
  keywords = 'stanze, alloggi, affitto, europa, studenti, expat',
  ogImage = '/images/og-image.jpg',
  ogType = 'website',
  canonical,
  locale = 'it_IT',
  schemaData,
  jsonLd,
  noindex = false
}) {
  // URL del sito
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ineoutroom.eu';
  
  // URL canonico completo
  const canonicalUrl = canonical ? `${siteUrl}${canonical}` : siteUrl;
  
  // URL immagine OpenGraph completo
  const ogImageUrl = ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`;
  
  return (
    <Head>
      {/* Meta tag di base */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta charSet="UTF-8" />
      {canonical && <link rel="canonical" href={canonicalUrl} />}
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      
      {/* OpenGraph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImageUrl} />
      <meta property="og:locale" content={locale} />
      <meta property="og:site_name" content="In&Out Room" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImageUrl} />
      {ogImage && <meta name="twitter:image:alt" content={`In&Out Room - ${title}`} />}
      
      {/* Link al sitemap e robots.txt */}
      <link rel="sitemap" type="application/xml" href={`${siteUrl}/sitemap.xml`} />
      
      {/* Dati strutturati JSON-LD - Schema singolo */}
      {schemaData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
      )}
      
      {/* Dati strutturati JSON-LD - Schemi multipli */}
      {jsonLd && jsonLd.length > 0 && jsonLd.map((schema, index) => (
        <script
          key={`json-ld-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </Head>
  );
}