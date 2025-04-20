import { Request, Response, NextFunction } from 'express';
import { logger, logWarning } from '../utils/logger';
import { trackResponseTime, trackWarning } from '../utils/alerting';

/**
 * Middleware per loggare tutte le richieste HTTP
 */
export const httpLogger = (req: Request, res: Response, next: NextFunction) => {
  // Memorizza il timestamp di inizio
  const startTime = new Date().getTime();
  
  // Prepara i dati da loggare
  const requestData = {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent') || 'unknown',
    referer: req.get('Referer') || 'direct',
    requestId: req.headers['x-request-id'] || 'unknown',
  };
  
  // Generate unico request ID se non presente
  if (requestData.requestId === 'unknown') {
    requestData.requestId = `req-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    req.headers['x-request-id'] = requestData.requestId as string;
  }
  
  // Log all'inizio della richiesta
  logger.http(`Richiesta ricevuta: ${req.method} ${req.url}`, requestData);
  
  // Override dei metodi di risposta per intercettare e loggare la risposta
  const originalSend = res.send;
  const originalJson = res.json;
  const originalEnd = res.end;
  
  // Funzione comune per tracciare il tempo di risposta
  const trackAndLogResponse = (statusCode: number, responseTime: number, responseType: string = '') => {
    const responseData = {
      statusCode,
      responseTime: `${responseTime}ms`,
      requestId: requestData.requestId,
    };
    
    // Log della risposta
    if (statusCode >= 400) {
      // Log di errore per le risposte di errore
      logger.error(`Risposta di errore${responseType}: ${req.method} ${req.url} ${statusCode}`, responseData);
      
      // Traccia warning per il sistema di alerting
      if (statusCode < 500) {
        trackWarning(`Errore client HTTP ${statusCode}: ${req.method} ${req.url}`);
      }
    } else {
      // Log normale per le risposte di successo
      logger.http(`Risposta${responseType} inviata: ${req.method} ${req.url} ${statusCode}`, responseData);
    }
    
    // Traccia il tempo di risposta per il sistema di alerting
    trackResponseTime(req.url, req.method, responseTime);
    
    // Logging avanzato per richieste API o pagine importanti
    if (req.url.startsWith('/api/') || req.url === '/' || req.url.includes('property')) {
      // Aggiungi metriche personalizzate
      logger.http(`Metriche richiesta: ${req.method} ${req.url}`, {
        requestId: requestData.requestId,
        duration: responseTime,
        status: statusCode,
        userAgent: requestData.userAgent,
        ip: requestData.ip,
        timestamp: new Date().toISOString()
      });
    }
  };
  
  // Sostituisci il metodo send
  res.send = function(body: any): Response {
    const responseTime = new Date().getTime() - startTime;
    trackAndLogResponse(res.statusCode, responseTime);
    return originalSend.call(this, body);
  };
  
  // Sostituisci il metodo json
  res.json = function(body: any): Response {
    const responseTime = new Date().getTime() - startTime;
    trackAndLogResponse(res.statusCode, responseTime, ' JSON');
    return originalJson.call(this, body);
  };
  
  // Sostituisci il metodo end
  res.end = function(chunk?: any, encoding?: BufferEncoding, cb?: () => void): Response {
    const responseTime = new Date().getTime() - startTime;
    
    // Log della risposta solo se non è già stato fatto dai metodi send o json
    if (!res.headersSent) {
      trackAndLogResponse(res.statusCode, responseTime);
    }
    
    return originalEnd.call(this, chunk, encoding, cb);
  };
  
  next();
};