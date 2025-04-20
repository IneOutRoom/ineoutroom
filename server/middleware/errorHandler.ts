import { Request, Response, NextFunction } from 'express';
import { logError } from '../utils/logger';
import { trackError } from '../utils/alerting';

/**
 * Middleware per gestire centralmente gli errori
 */
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Log dettagliato dell'errore
  logError('Errore applicazione', err);
  
  // Traccia l'errore per il sistema di alerting
  trackError(err);
  
  // Determina il codice di stato HTTP appropriato
  const statusCode = err.statusCode || 500;
  
  // Determina il messaggio di errore appropriato
  let errorMessage = 'Si è verificato un errore interno del server';
  
  // In sviluppo, mostriamo dettagli più specifici
  if (process.env.NODE_ENV !== 'production') {
    errorMessage = err.message || errorMessage;
  } else {
    // In produzione, usiamo un messaggio generico per gli errori 500
    // ma specifico per altri tipi di errori
    if (statusCode !== 500) {
      errorMessage = err.message || errorMessage;
    }
  }
  
  // Aggiungi metriche per il monitoraggio
  const errorData = {
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
    status: statusCode,
    error: err.name || 'Error',
    requestId: req.headers['x-request-id'] || 'unknown',
    userAgent: req.headers['user-agent'],
    ip: req.ip
  };
  
  // Log dettagliato per l'analisi
  logError(`Errore HTTP ${statusCode}: ${req.method} ${req.path}`, errorData);
  
  // Invia la risposta di errore
  res.status(statusCode).json({
    status: 'error',
    message: errorMessage,
    ...(process.env.NODE_ENV !== 'production' && { 
      stack: err.stack,
      details: err.details || err
    }),
  });
  
  // Non chiamiamo next() qui perché vogliamo che la catena di middleware si fermi
};