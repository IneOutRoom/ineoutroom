/**
 * API Route: /api/login
 * Gestisce l'autenticazione dell'utente
 */
export default async function handler(req, res) {
  // Verifica che la richiesta sia di tipo POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo non consentito' });
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  
  try {
    // Inoltra la richiesta di login all'API Express esistente
    const response = await fetch(`${apiUrl}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
      credentials: 'include',
    });
    
    // Ottieni lo stato e i dati dalla risposta
    const status = response.status;
    const data = await response.json().catch(() => ({}));
    
    // Se ci sono cookie nella risposta, passali alla risposta Next.js
    if (response.headers.get('set-cookie')) {
      res.setHeader('Set-Cookie', response.headers.get('set-cookie'));
    }
    
    // Restituisci la risposta con lo stesso status code
    return res.status(status).json(data);
  } catch (error) {
    console.error('Error in login API route:', error);
    return res.status(500).json({ error: 'Errore interno del server' });
  }
}