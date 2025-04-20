/**
 * API Route: /api/user
 * Restituisce le informazioni dell'utente autenticato
 */
export default async function handler(req, res) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  
  try {
    // Inoltra la richiesta all'API Express esistente, mantenendo i cookie per la sessione
    const response = await fetch(`${apiUrl}/api/user`, {
      method: req.method,
      headers: {
        ...req.headers,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    // Ottieni lo stato e i dati dalla risposta
    const status = response.status;
    const data = await response.json().catch(() => ({}));
    
    // Restituisci la risposta con lo stesso status code
    return res.status(status).json(data);
  } catch (error) {
    console.error('Error in user API route:', error);
    return res.status(500).json({ error: 'Errore interno del server' });
  }
}