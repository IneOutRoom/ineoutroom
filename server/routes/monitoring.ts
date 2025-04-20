import { Router, Request, Response } from "express";
import os from "os";
import fs from "fs";
import path from "path";
import { isAdmin } from "./admin";

// Inizializza il router
const router = Router();

// Inizializza le variabili globali per le metriche
if (!global.serverStartTime) {
  global.serverStartTime = Date.now();
  global.responseTimeAvg = 0;
  global.responseTimeMax = 0;
  global.responseTimeMin = 9999;
  global.errorRate = 0;
  global.requestCount = 0;
  global.activeUsers = 0;
  global.systemAlerts = [];
  global.cpuHistory = [];
}

// Endpoint per ottenere le metriche del sistema
router.get('/metrics', isAdmin, async (req: Request, res: Response) => {
  try {
    const uptime = Math.floor((Date.now() - global.serverStartTime) / 1000);
    const cpus = os.cpus();
    const cpuUsage = getCpuUsage(cpus);
    
    // Calcola la memoria utilizzata
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memoryPercentage = (usedMem / totalMem) * 100;
    
    // Determina lo stato del sistema in base a vari fattori
    let status = 'online';
    if (global.errorRate > 0.1 || memoryPercentage > 85 || cpuUsage > 80) {
      status = 'degraded';
    }
    
    // Costruisci l'oggetto delle metriche
    const metrics = {
      status,
      uptime,
      responseTime: {
        avg: Math.round(global.responseTimeAvg),
        max: global.responseTimeMax,
        min: global.responseTimeMin === 9999 ? 0 : global.responseTimeMin
      },
      errorRate: global.errorRate,
      requestCount: global.requestCount,
      memoryUsage: {
        used: usedMem,
        total: totalMem,
        percentage: memoryPercentage
      },
      activeUsers: global.activeUsers,
      cpuUsage
    };
    
    res.json(metrics);
  } catch (error) {
    console.error('Errore nel recupero delle metriche:', error);
    res.status(500).json({ message: 'Errore nel recupero delle metriche', error });
  }
});

// Endpoint per ottenere i log del server
router.get('/logs', isAdmin, async (req: Request, res: Response) => {
  try {
    const { level, filter, limit = 100 } = req.query;
    const logs = await readLogs(level as string, filter as string, Number(limit));
    res.json(logs);
  } catch (error) {
    console.error('Errore nel recupero dei log:', error);
    res.status(500).json({ message: 'Errore nel recupero dei log', error });
  }
});

// Endpoint per ottenere gli allarmi del sistema
router.get('/alerts', isAdmin, async (req: Request, res: Response) => {
  try {
    res.json(global.systemAlerts || []);
  } catch (error) {
    console.error('Errore nel recupero degli allarmi:', error);
    res.status(500).json({ message: 'Errore nel recupero degli allarmi', error });
  }
});

// Endpoint per riconoscere un allarme
router.post('/alerts/:id/acknowledge', isAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Trova l'allarme nell'array globale
    const alertIndex = global.systemAlerts.findIndex((a: any) => a.id === id);
    if (alertIndex === -1) {
      return res.status(404).json({ message: 'Allarme non trovato' });
    }
    
    // Aggiorna lo stato dell'allarme
    global.systemAlerts[alertIndex].status = 'acknowledged';
    
    res.json(global.systemAlerts[alertIndex]);
  } catch (error) {
    console.error('Errore nell\'aggiornamento dello stato dell\'allarme:', error);
    res.status(500).json({ message: 'Errore nell\'aggiornamento dello stato dell\'allarme', error });
  }
});

// Endpoint per risolvere un allarme
router.post('/alerts/:id/resolve', isAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Trova l'allarme nell'array globale
    const alertIndex = global.systemAlerts.findIndex((a: any) => a.id === id);
    if (alertIndex === -1) {
      return res.status(404).json({ message: 'Allarme non trovato' });
    }
    
    // Aggiorna lo stato dell'allarme
    global.systemAlerts[alertIndex].status = 'resolved';
    
    res.json(global.systemAlerts[alertIndex]);
  } catch (error) {
    console.error('Errore nell\'aggiornamento dello stato dell\'allarme:', error);
    res.status(500).json({ message: 'Errore nell\'aggiornamento dello stato dell\'allarme', error });
  }
});

// Funzione per leggere e filtrare i log dal file
async function readLogs(level?: string, filter?: string, limit: number = 100) {
  try {
    // In un'implementazione reale, leggerebbe da un file di log esistente
    // Per esempio, se utilizziamo Winston con il transport file
    const logFilePath = path.join(process.cwd(), 'logs', 'app.log');
    
    // Mock dei log per lo sviluppo
    // In un ambiente di produzione, sostituisci questo codice con la lettura effettiva
    // del file di log e il parsing delle linee
    const mockLogs = [
      {
        timestamp: '2025-04-17 23:45:40',
        level: 'error',
        message: 'Risposta di errore: GET /api/user 401',
        metadata: {
          statusCode: 401,
          responseTime: '3ms',
          requestId: 'req-1234567890',
        }
      },
      {
        timestamp: '2025-04-17 23:45:36',
        level: 'info',
        message: 'Server avviato sulla porta 5000',
      },
      {
        timestamp: '2025-04-17 23:45:32',
        level: 'http',
        message: 'Richiesta ricevuta: GET /api/properties',
        metadata: {
          method: 'GET',
          url: '/api/properties',
          ip: '127.0.0.1',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        }
      },
      {
        timestamp: '2025-04-17 23:43:15',
        level: 'warn',
        message: 'Tempo di risposta lento rilevato: GET /api/properties/search ha impiegato 2345ms',
        metadata: {
          threshold: '2000ms'
        }
      },
      {
        timestamp: '2025-04-17 23:40:22',
        level: 'debug',
        message: 'Esecuzione query database completata',
        metadata: {
          query: 'SELECT * FROM properties WHERE city = ? AND price < ?',
          params: ['Roma', 1000],
          duration: '45ms'
        }
      },
      {
        timestamp: '2025-04-17 23:32:18',
        level: 'error',
        message: 'Errore connessione database: Connection reset by peer',
        metadata: {
          error: 'ECONNRESET',
          attempt: 1,
          willRetry: true
        }
      }
    ];

    // Filtra i log se è specificato un livello
    let filteredLogs = level && level !== 'all' 
      ? mockLogs.filter(log => log.level === level)
      : mockLogs;
    
    // Filtra ulteriormente se è specificato un testo di ricerca
    if (filter) {
      const filterLowerCase = filter.toLowerCase();
      filteredLogs = filteredLogs.filter(log => 
        log.message.toLowerCase().includes(filterLowerCase) || 
        (log.metadata && JSON.stringify(log.metadata).toLowerCase().includes(filterLowerCase))
      );
    }
    
    // Limita il numero di log restituiti
    return filteredLogs.slice(0, limit);
  } catch (error) {
    console.error('Errore nella lettura dei log:', error);
    return [];
  }
}

// Funzione per estrarre i metadati da un messaggio di log
function extractMetadata(message: string) {
  // Implementazione di esempio per estrarre metadati da un messaggio di log
  // In un'implementazione reale, questo dipenderebbe dal formato del log
  const metadataMatch = message.match(/\{.*\}/);
  if (metadataMatch) {
    try {
      return JSON.parse(metadataMatch[0]);
    } catch (e) {
      return null;
    }
  }
  return null;
}

// Funzione per calcolare l'utilizzo della CPU
function getCpuUsage(cpus: os.CpuInfo[]) {
  // Per un calcolo reale, dovresti confrontare le misurazioni nel tempo
  // Questo è un calcolo approssimativo per scopi dimostrativi
  
  // In un'implementazione reale, salveremmo la storia e calcoleremmo
  // l'utilizzo effettivo nel tempo
  
  // Per ora, generiamo un valore casuale tra 10 e 90 per scopi dimostrativi
  const usage = 10 + Math.random() * 80;
  
  // Aggiungi alla cronologia (mantenendo gli ultimi N valori)
  if (global.cpuHistory) {
    global.cpuHistory.push({
      timestamp: Date.now(),
      usage
    });
    
    // Mantieni solo gli ultimi 60 valori (es. 1 ora se misurato ogni minuto)
    if (global.cpuHistory.length > 60) {
      global.cpuHistory.shift();
    }
  }
  
  return usage;
}

// Esporta il router
export default router;