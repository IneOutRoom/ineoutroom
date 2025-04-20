import { db } from '../../../server/db';
import { users } from '../../../shared/schema';
import { eq } from 'drizzle-orm';
import { generatePasswordResetToken } from '../utils/tokenUtils';
import { sendPasswordResetEmail } from '../utils/mailer';

/**
 * API endpoint per richiedere il ripristino della password
 * 
 * @param {import('next').NextApiRequest} req
 * @param {import('next').NextApiResponse} res
 */
export default async function handler(req, res) {
  // Accetta solo richieste POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Metodo non consentito' });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email mancante' });
    }

    // Cerca l'utente tramite email
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    // Per motivi di sicurezza, non rivelare se l'email esiste o meno
    // Restituisci sempre una risposta positiva
    if (existingUser.length === 0) {
      // Aggiungi un ritardo per prevenire timing attacks
      await new Promise(resolve => setTimeout(resolve, 1000));
      return res.status(200).json({ success: true, message: 'Se l\'indirizzo email esiste nel nostro database, ti abbiamo inviato un link di ripristino.' });
    }

    const user = existingUser[0];

    // Genera un token di reset password
    const resetToken = generatePasswordResetToken({ userId: user.id, email: user.email });

    // Invia l'email di reset password
    const emailSent = await sendPasswordResetEmail(user.email, resetToken);

    if (!emailSent) {
      return res.status(500).json({ success: false, message: 'Errore nell\'invio dell\'email di ripristino' });
    }

    return res.status(200).json({ success: true, message: 'Email di ripristino inviata con successo' });
  } catch (error) {
    console.error('Errore nella richiesta di ripristino password:', error);
    return res.status(500).json({ success: false, message: 'Errore del server' });
  }
}