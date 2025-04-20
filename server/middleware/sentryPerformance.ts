// Middleware per tracciare le prestazioni delle API con Sentry
import * as Sentry from '@sentry/node';
import { Request, Response, NextFunction } from 'express';
import { logInfo } from '../utils/logger';

// Definizione del tipo della transazione per evitare errori TypeScript
interface SafeTransaction {
  setData: (key: string, value: any) => void;
  setStatus: (status: string) => void;
  finish: () => void;
  startChild: (options: any) => any;
  startTimestamp: number;
}

// Genera un ID transazione univoco
function generateTransactionId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Crea un oggetto transazione fittizio per l'ambiente di sviluppo
function createDummyTransaction(): SafeTransaction {
  return {
    setData: () => {},
    setStatus: () => {},
    finish: () => {},
    startChild: () => ({ finish: () => {} }),
    startTimestamp: Date.now()
  };
}

/**
 * Middleware per tracciare prestazioni API con Sentry
 * Da utilizzare nelle rotte API per misurare i tempi di esecuzione
 * TEMPORANEAMENTE DISABILITATO PER PROBLEMI DI COMPATIBILITÀ
 */
export function trackAPIPerformance(routeName: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Disabilitiamo temporaneamente questo middleware
    // per problemi di compatibilità con la versione di Sentry
    next();
  };
}

/**
 * Utility per registrare una sottotransazione (span) all'interno di una transazione Sentry
 * Da utilizzare all'interno dei controller per tracciare operazioni specifiche
 * 
 * Esempio:
 * const span = startSpan(res, 'database-query');
 * // esegui query al database
 * finishSpan(span);
 */
export function startSpan(res: Response, operationName: string): any {
  // Disabilitiamo temporaneamente
  return {
    setData: () => {},
    finish: () => {}
  };
}

export function finishSpan(span: any): void {
  // Disabilitiamo temporaneamente
}