/**
 * API Route: /api/logout
 * Gestisce il logout dell'utente
 */
export default async function handler(req, res) {
  // Verifica che la richiesta sia di tipo POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo non consentito' });
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  
  try {
    // Inoltra la richiesta di logout all'API Express esistente
    const response = await fetch(`${apiUrl}/api/logout`, {
      method: 'POST',
      headers: {
        ...req.headers,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    // Se ci sono cookie nella risposta (per cancellare il cookie di sessione), passali alla risposta Next.js
    if (response.headers.get('set-cookie')) {
      res.setHeader('Set-Cookie', response.headers.get('set-cookie'));
    }
    
    // Restituisci lo stato HTTP appropriato
    return res.status(response.status).end();
  } catch (error) {
    console.error('Error in logout API route:', error);
    return res.status(500).json({ error: 'Errore interno del server' });
  }
}