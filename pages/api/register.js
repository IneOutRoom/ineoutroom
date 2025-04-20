import { db } from '../../server/db';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import { generateEmailVerificationToken } from './utils/tokenUtils';
import { sendVerificationEmail } from './utils/mailer';

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
 * API per la registrazione di un nuovo utente
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
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Dati incompleti' });
    }

    // Controlla se l'utente esiste già
    const existingUserByUsername = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existingUserByUsername.length > 0) {
      return res.status(400).json({ success: false, message: 'Username già in uso' });
    }

    const existingUserByEmail = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUserByEmail.length > 0) {
      return res.status(400).json({ success: false, message: 'Email già registrata' });
    }

    // Hash della password
    const hashedPassword = await hashPassword(password);

    // Crea l'utente nel database
    const [newUser] = await db
      .insert(users)
      .values({
        username,
        email,
        password: hashedPassword,
        emailVerified: false,
        role: 'user',
      })
      .returning();

    // Genera un token di verifica email
    const emailToken = generateEmailVerificationToken({ userId: newUser.id, email: newUser.email });

    // Invia l'email di verifica
    await sendVerificationEmail(newUser.email, emailToken);

    // Restituisce i dati dell'utente (escludendo la password)
    const { password: _, ...userWithoutPassword } = newUser;
    
    return res.status(201).json({ 
      ...userWithoutPassword,
      // Aggiungi un flag per indicare che l'email è stata inviata
      emailSent: true
    });
  } catch (error) {
    console.error('Errore nella registrazione dell\'utente:', error);
    return res.status(500).json({ success: false, message: 'Errore del server' });
  }
}