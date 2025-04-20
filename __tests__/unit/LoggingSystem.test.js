const winston = require('winston');
const { createLogger } = require('../../server/utils/logger');

// Mock di winston
jest.mock('winston', () => {
  const originalModule = jest.requireActual('winston');
  
  // Mock transport
  const mockTransport = {
    name: 'mock',
    log: jest.fn()
  };
  
  return {
    ...originalModule,
    createLogger: jest.fn().mockImplementation(() => ({
      add: jest.fn(),
      log: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn()
    })),
    format: {
      ...originalModule.format,
      timestamp: jest.fn().mockImplementation(() => originalModule.format(() => true)),
      combine: jest.fn().mockImplementation(() => originalModule.format(() => true)),
      printf: jest.fn().mockImplementation(() => originalModule.format(() => true)),
      colorize: jest.fn().mockImplementation(() => originalModule.format(() => true)),
      json: jest.fn().mockImplementation(() => originalModule.format(() => true))
    },
    transports: {
      Console: jest.fn().mockImplementation(() => mockTransport),
      File: jest.fn().mockImplementation(() => mockTransport)
    }
  };
});

describe('Sistema di Logging', () => {
  let logger;
  let consoleTransportSpy;
  let fileTransportSpy;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Spy sui trasporti
    consoleTransportSpy = jest.spyOn(winston.transports, 'Console');
    fileTransportSpy = jest.spyOn(winston.transports, 'File');
    
    // Crea il logger
    logger = createLogger();
  });

  test('dovrebbe creare un logger con configurazione corretta', () => {
    expect(winston.createLogger).toHaveBeenCalled();
    
    // Verifica che siano stati configurati i trasporti
    expect(consoleTransportSpy).toHaveBeenCalled();
    expect(fileTransportSpy).toHaveBeenCalled();
    
    // Verifica che siano stati configurati i formati
    expect(winston.format.combine).toHaveBeenCalled();
    expect(winston.format.timestamp).toHaveBeenCalled();
    expect(winston.format.printf).toHaveBeenCalled();
  });

  test('dovrebbe configurare il trasporto file con i percorsi giusti', () => {
    // Verifica le chiamate al trasporto file
    const calls = fileTransportSpy.mock.calls;
    
    // Dovrebbero esserci almeno due chiamate (una per gli errori, una per combined)
    expect(calls.length).toBeGreaterThanOrEqual(2);
    
    // Verifica che i percorsi contengano 'logs/'
    const fileOptions = calls.map(call => call[0]);
    fileOptions.forEach(options => {
      expect(options.filename).toContain('logs/');
    });
    
    // Verifica che ci sia un file specifico per gli errori
    const errorFile = fileOptions.find(options => options.level === 'error');
    expect(errorFile).toBeDefined();
    expect(errorFile.filename).toContain('error');
  });

  test('dovrebbe configurare correttamente i livelli di log', () => {
    // Verifica che il livello di log sia configurato correttamente
    const createLoggerCall = winston.createLogger.mock.calls[0][0];
    expect(createLoggerCall).toHaveProperty('level');
    
    // In ambiente di sviluppo dovrebbe usare 'debug'
    if (process.env.NODE_ENV === 'development') {
      expect(createLoggerCall.level).toBe('debug');
    } else {
      // In produzione dovrebbe usare 'info'
      expect(createLoggerCall.level).toBe('info');
    }
  });
});

// Test per il middleware di logging HTTP
describe('Middleware di logging HTTP', () => {
  const { createHttpLogger } = require('../../server/middleware/httpLogger');
  
  // Mock di express
  const mockExpress = {
    use: jest.fn()
  };
  
  // Mock del logger
  const mockLogger = {
    info: jest.fn(),
    error: jest.fn()
  };
  
  test('dovrebbe registrare un middleware per il logging HTTP', () => {
    // Inizializza il middleware
    createHttpLogger(mockExpress, mockLogger);
    
    // Verifica che express.use sia stato chiamato
    expect(mockExpress.use).toHaveBeenCalled();
    
    // Ottieni la funzione middleware
    const middleware = mockExpress.use.mock.calls[0][0];
    
    // Crea richiesta e risposta mock
    const req = {
      method: 'GET',
      originalUrl: '/api/test',
      ip: '127.0.0.1',
      headers: {
        'user-agent': 'Jest Test'
      }
    };
    
    const res = {
      statusCode: 200,
      getHeader: jest.fn().mockReturnValue('application/json'),
      on: jest.fn().mockImplementation((event, callback) => {
        if (event === 'finish') {
          callback();
        }
        return res;
      })
    };
    
    const next = jest.fn();
    
    // Esegui il middleware
    middleware(req, res, next);
    
    // Verifica che next sia stato chiamato
    expect(next).toHaveBeenCalled();
    
    // Verifica che il logger sia stato chiamato
    expect(mockLogger.info).toHaveBeenCalled();
    
    // Verifica che il log contenga le informazioni corrette
    const logCall = mockLogger.info.mock.calls[0][0];
    expect(logCall).toContain('GET /api/test');
    expect(logCall).toContain('200');
  });
  
  test('dovrebbe loggare errori con livello error', () => {
    // Inizializza il middleware
    createHttpLogger(mockExpress, mockLogger);
    
    // Ottieni la funzione middleware
    const middleware = mockExpress.use.mock.calls[0][0];
    
    // Crea richiesta e risposta mock con errore
    const req = {
      method: 'GET',
      originalUrl: '/api/error',
      ip: '127.0.0.1',
      headers: {
        'user-agent': 'Jest Test'
      }
    };
    
    const res = {
      statusCode: 500,
      getHeader: jest.fn().mockReturnValue('application/json'),
      on: jest.fn().mockImplementation((event, callback) => {
        if (event === 'finish') {
          callback();
        }
        return res;
      })
    };
    
    const next = jest.fn();
    
    // Esegui il middleware
    middleware(req, res, next);
    
    // Simula la fine della risposta con errore
    res.statusCode = 500;
    res.on.mock.calls[0][1]();
    
    // Verifica che il logger di errore sia stato chiamato
    expect(mockLogger.error).toHaveBeenCalled();
    
    // Verifica che il log contenga le informazioni corrette
    const logCall = mockLogger.error.mock.calls[0][0];
    expect(logCall).toContain('GET /api/error');
    expect(logCall).toContain('500');
  });
});

// Test per il sistema di alerting
describe('Sistema di Alerting', () => {
  const { setupAlerts } = require('../../server/utils/alertSystem');
  
  // Mock del logger
  const mockLogger = {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  };
  
  // Mock del sistema di notifiche
  const mockNotifier = {
    sendNotification: jest.fn().mockResolvedValue(true)
  };
  
  test('dovrebbe configurare le soglie di alert correttamente', () => {
    // Configura il sistema di alerting
    const alertSystem = setupAlerts(mockLogger, mockNotifier);
    
    expect(alertSystem).toBeDefined();
    expect(alertSystem).toHaveProperty('triggerCpuAlert');
    expect(alertSystem).toHaveProperty('triggerMemoryAlert');
    expect(alertSystem).toHaveProperty('triggerErrorRateAlert');
  });
  
  test('dovrebbe triggerare un alert quando supera la soglia CPU', async () => {
    // Configura il sistema di alerting
    const alertSystem = setupAlerts(mockLogger, mockNotifier);
    
    // Triggera un alert CPU
    await alertSystem.triggerCpuAlert(95);
    
    // Verifica che il logger sia stato chiamato
    expect(mockLogger.warn).toHaveBeenCalled();
    expect(mockLogger.warn.mock.calls[0][0]).toContain('CPU usage');
    
    // Verifica che la notifica sia stata inviata
    expect(mockNotifier.sendNotification).toHaveBeenCalled();
    expect(mockNotifier.sendNotification.mock.calls[0][0]).toContain('CPU');
    expect(mockNotifier.sendNotification.mock.calls[0][0]).toContain('95%');
  });
  
  test('non dovrebbe triggerare un alert quando è sotto la soglia CPU', async () => {
    // Configura il sistema di alerting
    const alertSystem = setupAlerts(mockLogger, mockNotifier);
    
    // Reset dei mock
    mockLogger.warn.mockClear();
    mockNotifier.sendNotification.mockClear();
    
    // Triggera un alert CPU con valore sotto soglia
    await alertSystem.triggerCpuAlert(75);
    
    // Verifica che il logger NON sia stato chiamato
    expect(mockLogger.warn).not.toHaveBeenCalled();
    
    // Verifica che la notifica NON sia stata inviata
    expect(mockNotifier.sendNotification).not.toHaveBeenCalled();
  });
  
  test('dovrebbe triggerare un alert di errore quando il rate supera la soglia', async () => {
    // Configura il sistema di alerting
    const alertSystem = setupAlerts(mockLogger, mockNotifier);
    
    // Reset dei mock
    mockLogger.error.mockClear();
    mockNotifier.sendNotification.mockClear();
    
    // Triggera un alert di errore
    await alertSystem.triggerErrorRateAlert(0.15); // 15% error rate
    
    // Verifica che il logger sia stato chiamato
    expect(mockLogger.error).toHaveBeenCalled();
    expect(mockLogger.error.mock.calls[0][0]).toContain('error rate');
    
    // Verifica che la notifica sia stata inviata
    expect(mockNotifier.sendNotification).toHaveBeenCalled();
    expect(mockNotifier.sendNotification.mock.calls[0][0]).toContain('Error rate');
    expect(mockNotifier.sendNotification.mock.calls[0][0]).toContain('15%');
  });
});