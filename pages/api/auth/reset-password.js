import { db } from '../../../server/db';
import { users } from '../../../shared/schema';
import { eq } from 'drizzle-orm';
import { verifyToken } from '../utils/tokenUtils';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

/**
 * Funzione per hash della password
 * @param {string} password - Password in chiaro
 * @returns {Promise<string>} - Password hashata con salt
 */
async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

/**
 * API endpoint per gestire il reset della password
 * 
 * @param {import('next').NextApiRequest} req
 * @param {import('next').NextApiResponse} res
 */
export default async function handler(req, res) {
  // GET per verificare il token, POST per il reset effettivo
  if (req.method === 'GET') {
    // Verifica token (usato dalla pagina di reset per controllare la validità del token)
    const { token, check } = req.query;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Token mancante' });
    }

    const decoded = verifyToken(token, 'password_reset');
    if (!decoded) {
      return res.status(400).json({ success: false, message: 'Token non valido o scaduto' });
    }

    // Se è solo un controllo, restituisci un semplice stato di successo
    if (check === 'true') {
      return res.status(200).json({ success: true, message: 'Token valido' });
    }

    return res.status(200).json({ success: true, decoded });

  } else if (req.method === 'POST') {
    // Reset della password
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        return res.status(400).json({ success: false, message: 'Dati mancanti' });
      }

      // Verifica il token
      const decoded = verifyToken(token, 'password_reset');
      if (!decoded) {
        return res.status(400).json({ success: false, message: 'Token non valido o scaduto' });
      }

      const { userId, email } = decoded;

      // Cerca l'utente
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (existingUser.length === 0) {
        return res.status(404).json({ success: false, message: 'Utente non trovato' });
      }

      const user = existingUser[0];

      // Verifica che l'email nel token corrisponda all'email dell'utente
      if (user.email !== email) {
        return res.status(400).json({ success: false, message: 'Email non corrispondente' });
      }

      // Hash della nuova password
      const hashedPassword = await hashPassword(password);

      // Aggiorna la password dell'utente
      await db
        .update(users)
        .set({ password: hashedPassword })
        .where(eq(users.id, userId));

      // Restituisci risposta di successo
      return res.status(200).json({ success: true, message: 'Password aggiornata con successo' });
    } catch (error) {
      console.error('Errore durante il reset della password:', error);
      return res.status(500).json({ success: false, message: 'Errore del server' });
    }
  } else {
    return res.status(405).json({ success: false, message: 'Metodo non consentito' });
  }
}