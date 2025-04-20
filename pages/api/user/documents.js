import { withAuth } from '../middleware/withAuth';

/**
 * API Route: /api/user/documents
 * Gestisce il recupero dei documenti dell'utente
 */
async function handler(req, res) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  
  if (req.method === 'GET') {
    try {
      // Ottieni i parametri dalla query
      const { role } = req.query;
      
      // Costruisci l'URL dell'API con i parametri di query
      let apiPath = `${apiUrl}/api/user/documents`;
      if (role) {
        apiPath += `?role=${role}`;
      }
      
      // Inoltra la richiesta all'API Express esistente
      const response = await fetch(apiPath, {
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
      console.error('Error in user/documents API route:', error);
      return res.status(500).json({ error: 'Errore interno del server' });
    }
  } else {
    return res.status(405).json({ error: 'Metodo non consentito' });
  }
}

export default withAuth(handler);