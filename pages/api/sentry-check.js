// pages/api/sentry-check.js
import * as Sentry from '@sentry/nextjs';

export default function handler(req, res) {
  // Imposta l'header content-type corretto
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'GET') {
    try {
      // Controlla se Sentry è configurato correttamente
      const isSentryEnabled = !!Sentry.getCurrentHub().getClient();
      
      // Informazioni su Sentry
      const sentryInfo = {
        enabled: isSentryEnabled,
        dsn: process.env.SENTRY_DSN ? "Configurato" : "Non configurato",
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
      };
      
      return res.status(200).json({
        success: true,
        message: "Stato di Sentry verificato con successo",
        sentryInfo
      });
    } catch (error) {
      // Cattura e invia l'errore a Sentry
      Sentry.captureException(error);
      
      return res.status(500).json({
        success: false,
        message: "Errore durante la verifica di Sentry",
        error: error.message
      });
    }
  } else {
    // Test di generazione errore
    if (req.method === 'POST') {
      try {
        // Genera un errore intenzionalmente
        throw new Error("Errore di test Sentry generato tramite API");
      } catch (error) {
        // Cattura e invia l'errore a Sentry
        Sentry.captureException(error);
        
        return res.status(200).json({
          success: true,
          message: "Errore di test generato con successo",
          error: error.message,
          sentToSentry: true
        });
      }
    }
    
    return res.status(405).json({ 
      success: false,
      message: "Metodo non consentito",
      allowedMethods: ['GET', 'POST']
    });
  }
}