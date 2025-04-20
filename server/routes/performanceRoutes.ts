import { Router } from 'express';
import * as Sentry from '@sentry/node';
import { captureError } from '../middleware/sentryMiddleware';
import { logInfo } from '../utils/logger';

// Creiamo un router Express per le rotte di performance
const router = Router();

// Test di latenza simulata
router.get('/test-latency', async (req, res) => {
  try {
    // Otteniamo il parametro delay dalla query (default 100ms)
    const delay = parseInt(req.query.delay as string) || 100;
    
    // Limitiamo il ritardo massimo a 2000ms per sicurezza
    const safeDelay = Math.min(Math.max(10, delay), 2000);
    
    // Simuliamo un'operazione con la latenza richiesta
    await new Promise(resolve => setTimeout(resolve, safeDelay));
    
    // Logghiamo l'operazione
    logInfo(`Test latenza completato con delay=${safeDelay}ms`);
    
    // Rispondiamo con i dettagli
    res.json({
      success: true,
      latency: safeDelay,
      timestamp: new Date().toISOString(),
      server: 'In&Out API Test Server'
    });
  } catch (error: any) {
    // In caso di errore, lo catturiamo con Sentry
    captureError(error, { 
      component: 'latency_test', 
      requestedDelay: req.query.delay 
    });
    
    // Rispondiamo con un errore
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Errore durante il test di latenza'
    });
  }
});

// Endpoint per ricevere report di performance dai client
router.post('/report-performance', async (req, res) => {
  try {
    const { type, duration, browser, ...otherData } = req.body;
    
    // Logghiamo i dati di performance
    logInfo(`Performance report: type=${type}, duration=${duration}ms`);
    
    // Inviamo un evento a Sentry
    Sentry.captureMessage(`Performance Test: ${type}`, {
      level: 'info',
      tags: {
        duration: duration,
        performanceTest: type,
      },
      extra: {
        browser,
        ...otherData,
        timestamp: new Date().toISOString()
      }
    });
    
    // Rispondiamo con successo
    res.json({ 
      success: true, 
      message: 'Report di performance ricevuto e registrato'
    });
  } catch (error: any) {
    // In caso di errore, lo catturiamo con Sentry
    captureError(error, { 
      component: 'performance_report_endpoint', 
      requestBody: JSON.stringify(req.body) 
    });
    
    // Rispondiamo con un errore
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Errore durante la registrazione del report'
    });
  }
});

// Endpoint per testare un errore controllato su Sentry
router.get('/test-error', (req, res) => {
  try {
    // Generiamo un errore controllato
    const errorType = req.query.type as string || 'generic';
    
    if (errorType === 'reference') {
      // Errore di riferimento a funzione non definita
      // @ts-ignore - Intenzionalmente generiamo un errore
      myUndefinedFunction();
    } else if (errorType === 'type') {
      // Errore di tipo
      // @ts-ignore - Intenzionalmente generiamo un errore
      const obj = null;
      obj.nonExistentMethod();
    } else {
      // Errore generico
      throw new Error('Test error generato manualmente');
    }
    
    // Questo codice non dovrebbe mai essere raggiunto
    res.json({ success: true });
  } catch (error: any) {
    // Catturiamo l'errore con Sentry
    Sentry.captureException(error);
    
    // Rispondiamo con i dettagli dell'errore
    res.status(500).json({
      success: false,
      message: 'Errore di test generato con successo',
      error: error.message,
      sentToSentry: true
    });
  }
});

export default router;