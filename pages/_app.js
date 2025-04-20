import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../client/src/lib/queryClient';
import '../client/src/index.css';
import { AuthProvider } from '../client/src/hooks/use-auth';
import { Toaster } from '../client/src/components/ui/toaster';
import Script from 'next/script';
import dynamic from 'next/dynamic';
import '../styles/cookie-patch.css';

function MyApp({ Component, pageProps }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {/* Caricamento ottimizzato Google Maps API */}
        <Script
          id="google-maps-js"
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
          strategy="afterInteractive"
          data-usercentrics="Google Maps"
        />
        
        <Component {...pageProps} />
        <Toaster />
        
        {/* Configurazione Google Analytics - Controllato da Usercentrics */}
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          data-usercentrics="Google Analytics"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX'}');
            `
          }}
        />
        
        {/* Script Google Analytics - Controllato da Usercentrics */}
        <Script
          id="google-analytics-tag"
          strategy="afterInteractive"
          data-usercentrics="Google Analytics"
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX'}`}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default MyApp;