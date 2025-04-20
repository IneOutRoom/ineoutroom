// server/middleware/sentryMiddleware.ts
import * as Sentry from '@sentry/node';
import { Request, Response, NextFunction, Express } from 'express';
import { logError, logInfo } from '../utils/logger';

// Inizializza Sentry per il server Express
export function initializeSentry(app: Express) {
  // Controlla se la variabile d'ambiente è definita
  if (!process.env.SENTRY_DSN) {
    logError('SENTRY_DSN non configurato, il monitoraggio degli errori è disabilitato');
    return;
  }

  try {
    // Inizializza Sentry con configurazione base
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      enabled: true,
      tracesSampleRate: 0.2,
      beforeSend(event) {
        // In sviluppo, logga localmente e non inviare
        if (process.env.NODE_ENV === 'development') {
          console.log('[Sentry Debug]', event);
          return null;
        }
        return event;
      },
    });
    
    // Registriamo middleware per catturare richieste (versione sicura)
    try {
      // @ts-ignore - Ignoriamo errori di tipizzazione
      if (Sentry.Handlers && Sentry.Handlers.requestHandler) {
        // @ts-ignore
        app.use(Sentry.Handlers.requestHandler());
      } else {
        app.use((req, res, next) => next()); // Middleware dummy
      }
    } catch (e) {
      logError('Errore configurazione Sentry requestHandler: ' + e);
    }
    
    logInfo('Sentry inizializzato per il monitoraggio degli errori');
  } catch (error) {
    logError(`Errore durante l'inizializzazione di Sentry: ${error}`);
  }
}

// Middleware per la gestione degli errori Sentry
// Deve essere utilizzato PRIMA del middleware errorHandler
export function sentryErrorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  // Cattura e invia l'errore a Sentry
  Sentry.captureException(err);
  // Continua con la catena dei middleware
  next(err);
}

// Utility per tracciare manualmente errori specifici
export function captureError(error: Error, context: Record<string, any> = {}) {
  // Versione semplificata che evita problemi di compatibilità
  try {
    // Aggiungiamo i dettagli del contesto all'errore direttamente
    const errorWithContext = new Error(error.message);
    errorWithContext.name = error.name;
    errorWithContext.stack = error.stack;
    
    // Aggiungiamo il contesto come proprietà dell'errore
    Object.assign(errorWithContext, { sentryContext: context });
    
    // Invia l'errore a Sentry
    Sentry.captureException(errorWithContext);
  } catch (e) {
    // Fallback se ci sono problemi con Sentry
    console.error('Errore durante l\'invio a Sentry:', e);
    console.error('Errore originale:', error);
  }
}