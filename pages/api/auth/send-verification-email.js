import { db } from '../../../server/db';
import { users } from '../../../shared/schema';
import { eq } from 'drizzle-orm';
import { generateEmailVerificationToken } from '../utils/tokenUtils';
import { sendVerificationEmail } from '../utils/mailer';

/**
 * API endpoint per inviare un'email di verifica
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
      return res.status(200).json({ success: true, message: 'Se l\'indirizzo email esiste nel nostro database, ti abbiamo inviato un link di verifica.' });
    }

    const user = existingUser[0];

    // Se l'utente ha già verificato l'email, non inviare un'altra email
    if (user.emailVerified) {
      return res.status(200).json({ success: true, message: 'Il tuo indirizzo email è già stato verificato' });
    }

    // Genera un token di verifica dell'email
    const emailToken = generateEmailVerificationToken({ userId: user.id, email: user.email });

    // Invia l'email di verifica
    const emailSent = await sendVerificationEmail(user.email, emailToken);

    if (!emailSent) {
      return res.status(500).json({ success: false, message: 'Errore nell\'invio dell\'email di verifica' });
    }

    return res.status(200).json({ success: true, message: 'Email di verifica inviata con successo' });
  } catch (error) {
    console.error('Errore nell\'invio dell\'email di verifica:', error);
    return res.status(500).json({ success: false, message: 'Errore del server' });
  }
}