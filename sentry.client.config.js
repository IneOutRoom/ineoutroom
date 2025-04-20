// sentry.client.config.js
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  // Lasciamo alto il sample rate in ambiente di sviluppo
  // In produzione potresti voler ridurre questo valore (es. 0.1 per il 10%)
  tracesSampleRate: 1.0,
  
  // Configura le opzioni per l'invio di informazioni aggiuntive
  integrations: [
    new Sentry.Replay({
      // Cattura errori e interazioni utente per debug
      maskAllText: false,
      blockAllMedia: true,
    }),
  ],
  
  // Configura il comportamento di cattura
  beforeSend(event) {
    // Non inviare informazioni sensibili in sviluppo
    if (process.env.NODE_ENV === 'development') {
      console.warn('Sentry error in development:', event);
      return null;
    }
    return event;
  },
  
  // Aggiunge metadati all'evento
  initialScope: {
    tags: {
      environment: process.env.NODE_ENV || 'development',
      app: 'ineoutroom-client',
    },
  },
});