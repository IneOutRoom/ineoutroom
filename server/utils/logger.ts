import winston from 'winston';

// Definisci i livelli e i colori per la console
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Aggiungi i colori a winston
winston.addColors(colors);

// Definisci il formato del log
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Definisci i trasporti (dove verranno salvati i log)
const transports = [
  // Log sulla console con colori
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize({ all: true }),
      format
    ),
  }),
  // Log su file per errori
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    format,
  }),
  // Log su file per tutte le info
  new winston.transports.File({ 
    filename: 'logs/combined.log',
    format,
  }),
];

// Se siamo in produzione, aggiungi anche un trasporto HTTP per Elasticsearch
if (process.env.NODE_ENV === 'production') {
  transports.push(
    new winston.transports.Http({
      host: process.env.ELASTIC_HOST || 'localhost',
      port: process.env.ELASTIC_PORT ? parseInt(process.env.ELASTIC_PORT) : 9200,
      path: '/logs',
      ssl: process.env.ELASTIC_SSL === 'true',
      format: winston.format.json(),
    })
  );
}

// Crea il logger
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format,
  transports,
});

// Creazione cartella logs se non esiste
import fs from 'fs';
import path from 'path';

const logDir = 'logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Funzioni helper
export const logError = (message: string, error?: any) => {
  const errorMessage = error instanceof Error 
    ? `${message}: ${error.message}` 
    : `${message}: ${JSON.stringify(error)}`;
    
  logger.error(errorMessage);
  
  if (error instanceof Error && error.stack) {
    logger.error(`Stack: ${error.stack}`);
  }
};

export const logInfo = (message: string, data?: any) => {
  if (data) {
    logger.info(`${message}: ${JSON.stringify(data)}`);
  } else {
    logger.info(message);
  }
};

export const logWarning = (message: string, data?: any) => {
  if (data) {
    logger.warn(`${message}: ${JSON.stringify(data)}`);
  } else {
    logger.warn(message);
  }
};

export const logDebug = (message: string, data?: any) => {
  if (data) {
    logger.debug(`${message}: ${JSON.stringify(data)}`);
  } else {
    logger.debug(message);
  }
};

export const logHttp = (message: string, data?: any) => {
  if (data) {
    logger.http(`${message}: ${JSON.stringify(data)}`);
  } else {
    logger.http(message);
  }
};