/**
 * API Route: /api/create-payment-intent
 * Crea un payment intent per Stripe
 */
export default async function handler(req, res) {
  // Verifica che la richiesta sia di tipo POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo non consentito' });
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  
  try {
    // Inoltra la richiesta all'API Express esistente
    const response = await fetch(`${apiUrl}/api/create-payment-intent`, {
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
    const data = await response.json().catch(() => ({ error: 'Errore nella risposta' }));
    
    // Restituisci la risposta con lo stesso status code
    return res.status(status).json(data);
  } catch (error) {
    console.error('Error in create-payment-intent API route:', error);
    return res.status(500).json({ error: 'Errore interno del server' });
  }
}