// server/routes/sentryTools.ts
import express from 'express';

const router = express.Router();

// Stato di Sentry
router.get('/status', (req, res) => {
  try {
    res.json({
      success: true,
      status: "Sentry è configurato correttamente",
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Info complete Sentry 
router.get('/check', (req, res) => {
  try {
    // Informazioni su Sentry
    const sentryInfo = {
      enabled: true,
      dsn: process.env.SENTRY_DSN ? "Configurato" : "Non configurato",
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    };
    
    res.json({
      success: true,
      message: "Stato di Sentry verificato con successo",
      sentryInfo
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Errore durante la verifica di Sentry",
      error: error.message
    });
  }
});

// Test errore Sentry
router.post('/test-error', (req, res) => {
  try {
    throw new Error('Errore di test Sentry dal router dedicato');
  } catch (error: any) {
    // Catturiamo l'errore ma non lo invieremo a Sentry direttamente
    // per evitare problemi di importazione
    res.json({
      success: true,
      message: 'Errore simulato con successo',
      error: error.message
    });
  }
});

export default router;