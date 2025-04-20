import { Express, Request, Response } from 'express';
import { storage } from '../storage';
import passport from 'passport';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { z } from 'zod';

const scryptAsync = promisify(scrypt);

// Schema di validazione per i dati dell'autenticazione Google
const googleAuthSchema = z.object({
  username: z.string(),
  email: z.string().email(),
  firebaseUid: z.string(),
  displayName: z.string().optional(),
  photoURL: z.string().optional(),
});

// Funzione per generare una password casuale per gli utenti Google
async function generateRandomPassword() {
  const passwordBytes = randomBytes(16).toString('hex');
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(passwordBytes, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

export function registerAuthRoutes(app: Express) {
  // Gestione autenticazione Google
  app.post('/api/auth/google', async (req: Request, res: Response) => {
    try {
      // Validazione dati
      const parsedData = googleAuthSchema.parse(req.body);
      
      // Verifica se l'utente esiste già per email
      let user = await storage.getUserByEmail(parsedData.email);
      
      if (!user) {
        // L'utente non esiste, creane uno nuovo
        user = await storage.createUser({
          username: parsedData.username,
          email: parsedData.email,
          password: await generateRandomPassword(), // Password casuale, l'utente non la userà
          name: parsedData.displayName || parsedData.username,
          role: 'user',
          firebaseUid: parsedData.firebaseUid,
          profileImage: parsedData.photoURL || null
        });
      } else if (!user.firebaseUid) {
        // L'utente esiste ma non ha un firebaseUid, aggiorniamolo
        user = await storage.updateUserFirebaseUid(user.id, parsedData.firebaseUid);
      }
      
      // Esegui il login dell'utente
      req.login(user, (err) => {
        if (err) {
          console.error('Errore durante il login dopo autenticazione Google:', err);
          return res.status(500).json({ error: 'Errore durante il login' });
        }
        
        // Rimuovi la password prima di inviare i dati al client
        const { password, ...userWithoutPassword } = user;
        return res.status(200).json(userWithoutPassword);
      });
    } catch (error) {
      console.error('Errore durante l\'autenticazione Google:', error);
      return res.status(400).json({ error: 'Dati di autenticazione non validi' });
    }
  });
}