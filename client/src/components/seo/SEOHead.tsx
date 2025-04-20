import React from 'react';
import Head from 'next/head';

export interface SEOProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogType?: 'website' | 'article' | 'product' | 'profile';
  ogImage?: string;
  ogImageAlt?: string;
  ogUrl?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  schemaData?: Record<string, any>;
  noindex?: boolean;
}

/**
 * Componente per gestire i meta tag SEO e Open Graph in modo centralizzato
 * Utilizza Next.js Head per inserire i tag nel <head> del documento
 */
export const SEOHead: React.FC<SEOProps> = ({
  title,
  description,
  canonicalUrl,
  ogType = 'website',
  ogImage,
  ogImageAlt,
  ogUrl,
  twitterCard = 'summary_large_image',
  schemaData,
  noindex = false,
}) => {
  // Costruisci il titolo completo con il nome del sito
  const fullTitle = `${title} | In&Out Room`;
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ineoutroom.eu';
  
  // Usa URL relativo o assoluto per il canonical
  const canonicalFullUrl = canonicalUrl 
    ? (canonicalUrl.startsWith('http') ? canonicalUrl : `${baseUrl}${canonicalUrl}`)
    : undefined;
  
  // Usa URL relativo o assoluto per l'immagine OG
  const ogImageFullUrl = ogImage 
    ? (ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`)
    : `${baseUrl}/images/og-default.jpg`;
  
  // Genera JSON-LD per schemaData
  const schemaJSON = schemaData 
    ? `<script type="application/ld+json">${JSON.stringify(schemaData)}</script>`
    : '';
  
  return (
    <Head>
      {/* Meta tag di base */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {canonicalFullUrl && <link rel="canonical" href={canonicalFullUrl} />}
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      
      {/* Open Graph meta tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      {ogUrl && <meta property="og:url" content={ogUrl} />}
      <meta property="og:image" content={ogImageFullUrl} />
      {ogImageAlt && <meta property="og:image:alt" content={ogImageAlt} />}
      <meta property="og:site_name" content="In&Out Room" />
      <meta property="og:locale" content="it_IT" />
      
      {/* Twitter Card meta tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImageFullUrl} />
      {ogImageAlt && <meta name="twitter:image:alt" content={ogImageAlt} />}
      
      {/* Schema.org JSON-LD (iniettato tramite dangerouslySetInnerHTML) */}
      {schemaData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
      )}
    </Head>
  );
};

export default SEOHead;