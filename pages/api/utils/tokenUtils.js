import jwt from 'jsonwebtoken';

// Secret per la firma dei token JWT
const JWT_SECRET = process.env.JWT_SECRET || 'inout-secret-key-change-in-production';

/**
 * Genera un token per la verifica dell'email
 * @param {Object} payload - Dati da includere nel token
 * @param {number} expiresIn - Durata del token in secondi (default: 24 ore)
 * @returns {string} - Token JWT firmato
 */
export function generateEmailVerificationToken(payload, expiresIn = 86400) {
  return jwt.sign(
    {
      ...payload,
      type: 'email_verification'
    },
    JWT_SECRET,
    { expiresIn }
  );
}

/**
 * Genera un token per il reset della password
 * @param {Object} payload - Dati da includere nel token
 * @param {number} expiresIn - Durata del token in secondi (default: 1 ora)
 * @returns {string} - Token JWT firmato
 */
export function generatePasswordResetToken(payload, expiresIn = 3600) {
  return jwt.sign(
    {
      ...payload,
      type: 'password_reset'
    },
    JWT_SECRET,
    { expiresIn }
  );
}

/**
 * Verifica un token JWT
 * @param {string} token - Token JWT da verificare
 * @param {string} type - Tipo di token atteso ('email_verification' o 'password_reset')
 * @returns {Object|null} - Payload decodificato o null se il token non è valido
 */
export function verifyToken(token, type) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verifica che il tipo di token corrisponda a quello atteso
    if (decoded.type !== type) {
      return null;
    }
    
    return decoded;
  } catch (error) {
    console.error('Errore durante la verifica del token:', error);
    return null;
  }
}