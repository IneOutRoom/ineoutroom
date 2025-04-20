import { logError, logWarning, logInfo } from './logger';
import { captureError } from '../middleware/sentryMiddleware';

// Interfaccia per le configurazioni di notifica
interface AlertConfig {
  enabled: boolean;
  thresholds: {
    error: number;      // Numero di errori in un periodo di tempo
    warning: number;    // Numero di avvisi in un periodo di tempo
    responseTime: number; // Soglia in ms per tempi di risposta lenti
    memoryUsage: number;  // Percentuale di utilizzo memoria
  };
  cooldown: number;     // Periodo in ms tra notifiche dello stesso tipo
}

// Interfaccia per i canali di notifica
interface NotificationChannel {
  name: string;
  send: (message: string, level: 'error' | 'warning' | 'info') => Promise<boolean>;
}

// Configurazione predefinita
const defaultConfig: AlertConfig = {
  enabled: process.env.ENABLE_ALERTS === 'true',
  thresholds: {
    error: process.env.ALERT_ERROR_THRESHOLD ? parseInt(process.env.ALERT_ERROR_THRESHOLD) : 5,
    warning: process.env.ALERT_WARNING_THRESHOLD ? parseInt(process.env.ALERT_WARNING_THRESHOLD) : 10,
    responseTime: process.env.ALERT_RESPONSE_TIME ? parseInt(process.env.ALERT_RESPONSE_TIME) : 5000,
    memoryUsage: process.env.ALERT_MEMORY_USAGE ? parseInt(process.env.ALERT_MEMORY_USAGE) : 85,
  },
  cooldown: process.env.ALERT_COOLDOWN ? parseInt(process.env.ALERT_COOLDOWN) : 300000, // 5 minuti
};

// Implementazione di canale di notifica console (per sviluppo)
const consoleChannel: NotificationChannel = {
  name: 'console',
  send: async (message: string, level: 'error' | 'warning' | 'info') => {
    switch (level) {
      case 'error':
        logError(`[ALERT] ${message}`);
        break;
      case 'warning':
        logWarning(`[ALERT] ${message}`);
        break;
      case 'info':
        logInfo(`[ALERT] ${message}`);
        break;
    }
    return true;
  }
};

// Email channel (simulato)
const emailChannel: NotificationChannel = {
  name: 'email',
  send: async (message: string, level: 'error' | 'warning' | 'info') => {
    // In produzione, questa funzione invierebbe un'email reale
    logInfo(`[EMAIL ALERT] Invio email con livello ${level}: ${message}`);
    // Qui implementeremmo l'integrazione con un servizio di invio email
    return true;
  }
};

// Slack channel (simulato)
const slackChannel: NotificationChannel = {
  name: 'slack',
  send: async (message: string, level: 'error' | 'warning' | 'info') => {
    // In produzione, questa funzione invierebbe un messaggio a Slack
    logInfo(`[SLACK ALERT] Invio messaggio a Slack con livello ${level}: ${message}`);
    // Qui implementeremmo l'integrazione con Slack API
    return true;
  }
};

// Classe per il monitoraggio e l'invio di avvisi
class AlertManager {
  private config: AlertConfig;
  private channels: NotificationChannel[];
  private errorCount: number = 0;
  private warningCount: number = 0;
  private lastAlerts: Map<string, number> = new Map();
  
  constructor(config: AlertConfig = defaultConfig) {
    this.config = config;
    this.channels = [consoleChannel];
    
    // In ambiente di produzione aggiungiamo canali aggiuntivi
    if (process.env.NODE_ENV === 'production') {
      if (process.env.ENABLE_EMAIL_ALERTS === 'true') {
        this.channels.push(emailChannel);
      }
      if (process.env.ENABLE_SLACK_ALERTS === 'true') {
        this.channels.push(slackChannel);
      }
    }
    
    // Avviamo il monitoraggio periodico delle risorse
    this.startResourceMonitoring();
  }
  
  // Monitoraggio periodico delle risorse del sistema
  private startResourceMonitoring() {
    setInterval(() => {
      this.checkMemoryUsage();
    }, 60000); // Controlla ogni minuto
  }
  
  // Controlla l'utilizzo della memoria
  private checkMemoryUsage() {
    const memoryUsage = process.memoryUsage();
    const heapUsedPercentage = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
    
    if (heapUsedPercentage > this.config.thresholds.memoryUsage) {
      this.sendAlert(
        `Utilizzo elevato della memoria: ${heapUsedPercentage.toFixed(2)}% (${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB / ${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB)`,
        'warning',
        'memory'
      );
    }
  }
  
  // Traccia un errore e invia avviso se necessario
  public trackError(error: Error | string) {
    this.errorCount++;
    
    // Invia errore a Sentry per tracciamento dettagliato
    if (error instanceof Error) {
      captureError(error, { 
        source: 'alertManager',
        errorCount: this.errorCount,
        timestamp: new Date().toISOString()
      });
    } else {
      captureError(new Error(error), { 
        source: 'alertManager',
        errorCount: this.errorCount,
        timestamp: new Date().toISOString()
      });
    }
    
    if (this.errorCount >= this.config.thresholds.error) {
      this.sendAlert(
        `Rilevati ${this.errorCount} errori nell'applicazione nell'ultimo periodo. Ultimo errore: ${error instanceof Error ? error.message : error}`,
        'error',
        'error_threshold'
      );
      this.errorCount = 0; // Reset del contatore
    }
  }
  
  // Traccia un avviso e invia notifica se necessario
  public trackWarning(message: string) {
    this.warningCount++;
    
    if (this.warningCount >= this.config.thresholds.warning) {
      this.sendAlert(
        `Rilevati ${this.warningCount} avvisi nell'applicazione nell'ultimo periodo. Ultimo avviso: ${message}`,
        'warning',
        'warning_threshold'
      );
      this.warningCount = 0; // Reset del contatore
    }
  }
  
  // Traccia il tempo di risposta e invia avviso se troppo lento
  public trackResponseTime(path: string, method: string, time: number) {
    if (time > this.config.thresholds.responseTime) {
      this.sendAlert(
        `Tempo di risposta lento rilevato: ${method} ${path} ha impiegato ${time}ms (soglia: ${this.config.thresholds.responseTime}ms)`,
        'warning',
        `slow_response_${path}`
      );
    }
  }
  
  // Metodo generico per inviare un avviso su tutti i canali configurati
  private async sendAlert(message: string, level: 'error' | 'warning' | 'info', alertType: string) {
    if (!this.config.enabled) return;
    
    // Verifichiamo se è trascorso abbastanza tempo dall'ultimo alert di questo tipo
    const lastAlertTime = this.lastAlerts.get(alertType) || 0;
    const now = Date.now();
    
    if (now - lastAlertTime < this.config.cooldown) {
      return; // Ancora in cooldown per questo tipo di avviso
    }
    
    // Aggiorniamo il timestamp dell'ultimo avviso di questo tipo
    this.lastAlerts.set(alertType, now);
    
    // Inviamo l'avviso su tutti i canali configurati
    for (const channel of this.channels) {
      try {
        await channel.send(message, level);
      } catch (error) {
        logError(`Errore durante l'invio dell'avviso sul canale ${channel.name}`, error);
      }
    }
  }
}

// Esportiamo una singola istanza di AlertManager
export const alertManager = new AlertManager();

// Funzioni helper per utilizzare l'AlertManager
export const trackError = (error: Error | string) => alertManager.trackError(error);
export const trackWarning = (message: string) => alertManager.trackWarning(message);
export const trackResponseTime = (path: string, method: string, time: number) => 
  alertManager.trackResponseTime(path, method, time);