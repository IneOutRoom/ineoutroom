/** @type {import('next').NextConfig} */
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['loremflickr.com', 'cloudflare-ipfs.com', 'randomuser.me'],
  },
  experimental: {
    externalDir: true,
  },
  // Aggiungiamo il supporto per servire contenuti dalla directory client/src
  transpilePackages: ["@/components", "@/hooks", "@/lib", "@/pages", "@/utils"],
  // Configurazione per Sentry
  sentry: {
    // Disabilita la creazione automatica di source maps in development
    disableServerWebpackPlugin: process.env.NODE_ENV === 'development',
    disableClientWebpackPlugin: process.env.NODE_ENV === 'development',
    // Nascondi i messaggi di errore nell'UI per gli utenti finali
    hideSourceMaps: true,
  }
};

// Configurazione avanzata di Sentry
const sentryWebpackPluginOptions = {
  // Ulteriori opzioni per il plugin webpack di Sentry
  silent: true, // Sopprime i messaggi del plugin all'avvio
  authToken: process.env.SENTRY_AUTH_TOKEN,
  org: "ineoutroom",
  project: "ineoutroom-nextjs",
};

// Esporta la configurazione con Sentry
export default withSentryConfig(nextConfig, sentryWebpackPluginOptions);