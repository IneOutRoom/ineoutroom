// sentry.edge.config.js
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  
  // Configura il comportamento di cattura per le funzioni Edge
  beforeSend(event) {
    // Non inviare informazioni sensibili in sviluppo
    if (process.env.NODE_ENV === 'development') {
      console.warn('Sentry error in development (edge):', event);
      return null;
    }
    return event;
  },
  
  // Aggiunge metadati all'evento
  initialScope: {
    tags: {
      environment: process.env.NODE_ENV || 'development',
      app: 'ineoutroom-edge',
    },
  },
});