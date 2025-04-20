import { db } from '../../../server/db';
import { users } from '../../../shared/schema';
import { eq } from 'drizzle-orm';
import { verifyToken } from '../utils/tokenUtils';

/**
 * API endpoint per verificare l'email tramite token
 * 
 * @param {import('next').NextApiRequest} req
 * @param {import('next').NextApiResponse} res
 */
export default async function handler(req, res) {
  // Accetta solo richieste GET
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Metodo non consentito' });
  }

  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Token mancante' });
    }

    // Verifica il token
    const decoded = verifyToken(token, 'email_verification');
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

    // Se l'email è già stata verificata, restituisci un messaggio di successo
    if (user.emailVerified) {
      return res.status(200).json({ success: true, message: 'Email già verificata' });
    }

    // Aggiorna lo stato di verifica dell'email
    await db
      .update(users)
      .set({ emailVerified: true })
      .where(eq(users.id, userId));

    // Restituisci risposta di successo
    return res.status(200).json({ success: true, message: 'Email verificata con successo' });
  } catch (error) {
    console.error('Errore durante la verifica dell\'email:', error);
    return res.status(500).json({ success: false, message: 'Errore del server' });
  }
}