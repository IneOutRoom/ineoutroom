import { withAuth } from './middleware/withAuth';

/**
 * API Route: /api/documents
 * Gestisce il caricamento e il recupero dei documenti
 */
async function handler(req, res) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  
  if (req.method === 'GET') {
    try {
      // Inoltra la richiesta all'API Express esistente
      const response = await fetch(`${apiUrl}/api/documents`, {
        method: 'GET',
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
      console.error('Error in documents API route:', error);
      return res.status(500).json({ error: 'Errore interno del server' });
    }
  } else if (req.method === 'POST') {
    try {
      // Inoltra la richiesta all'API Express esistente
      const response = await fetch(`${apiUrl}/api/documents`, {
        method: 'POST',
        headers: {
          ...req.headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
        credentials: 'include',
      });
      
      // Ottieni lo stato e i dati dalla risposta
      const status = response.status;
      const data = await response.json().catch(() => ({}));
      
      // Restituisci la risposta con lo stesso status code
      return res.status(status).json(data);
    } catch (error) {
      console.error('Error in documents API route:', error);
      return res.status(500).json({ error: 'Errore interno del server' });
    }
  } else {
    return res.status(405).json({ error: 'Metodo non consentito' });
  }
}

export default withAuth(handler);