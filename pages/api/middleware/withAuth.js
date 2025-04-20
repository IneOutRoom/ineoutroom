/**
 * Middleware per verificare l'autenticazione dell'utente nelle API routes
 * Questo middleware può essere utilizzato per proteggere le API routes che richiedono autenticazione
 */

export function withAuth(handler) {
  return async (req, res) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    
    try {
      // Verifica se l'utente è autenticato chiamando l'API Express
      const userResponse = await fetch(`${apiUrl}/api/user`, {
        method: 'GET',
        headers: {
          ...req.headers,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      // Se l'utente non è autenticato, restituisci un errore 401
      if (userResponse.status === 401) {
        return res.status(401).json({ error: 'Non autenticato' });
      }
      
      // Estrai i dati dell'utente
      const user = await userResponse.json();
      
      // Aggiungi l'utente alla richiesta
      req.user = user;
      
      // Passa alla funzione handler
      return handler(req, res);
    } catch (error) {
      console.error('Error in withAuth middleware:', error);
      return res.status(500).json({ error: 'Errore interno del server' });
    }
  };
}

export default withAuth;