import { Request, Response, NextFunction } from 'express';
import { log } from '../vite';

/**
 * Middleware per verificare se l'utente è autenticato
 */
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  
  log(`Accesso negato: utente non autenticato per ${req.method} ${req.originalUrl}`, "warning");
  return res.status(401).json({ error: "Accesso non autorizzato. Effettua il login." });
}

/**
 * Middleware per verificare se l'utente ha un determinato ruolo
 */
export function hasRole(role: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      log(`Accesso negato: utente non autenticato per ${req.method} ${req.originalUrl}`, "warning");
      return res.status(401).json({ error: "Accesso non autorizzato. Effettua il login." });
    }
    
    if (req.user?.role !== role) {
      log(`Accesso negato: utente senza ruolo ${role} per ${req.method} ${req.originalUrl}`, "warning");
      return res.status(403).json({ error: "Accesso negato. Non hai i permessi necessari." });
    }
    
    return next();
  };
}

/**
 * Middleware per verificare se l'utente è il proprietario della risorsa
 */
export function isResourceOwner(resourceIdParam: string, userIdField: string = 'userId') {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      log(`Accesso negato: utente non autenticato per ${req.method} ${req.originalUrl}`, "warning");
      return res.status(401).json({ error: "Accesso non autorizzato. Effettua il login." });
    }
    
    const resourceId = parseInt(req.params[resourceIdParam]);
    if (isNaN(resourceId)) {
      return res.status(400).json({ error: "ID risorsa non valido" });
    }
    
    // Ottieni la risorsa dal database
    const resource = req.body;
    
    if (!resource) {
      return res.status(404).json({ error: "Risorsa non trovata" });
    }
    
    if (resource[userIdField] !== req.user?.id) {
      log(`Accesso negato: utente non proprietario della risorsa ${resourceId}`, "warning");
      return res.status(403).json({ error: "Accesso negato. Non sei il proprietario di questa risorsa." });
    }
    
    return next();
  };
}