import { withAuth } from '../middleware/withAuth';

/**
 * API Route: /api/admin/reports
 * Restituisce le segnalazioni delle recensioni per la dashboard amministrativa
 */
async function handler(req, res) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  
  // Verifica che l'utente sia un amministratore
  if (req.user.id !== 1) {
    return res.status(403).json({ error: 'Accesso negato: permessi di amministratore richiesti' });
  }
  
  try {
    // Inoltra la richiesta all'API Express esistente
    const response = await fetch(`${apiUrl}/api/admin/reports`, {
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
    console.error('Error in admin/reports API route:', error);
    return res.status(500).json({ error: 'Errore interno del server' });
  }
}

export default withAuth(handler);