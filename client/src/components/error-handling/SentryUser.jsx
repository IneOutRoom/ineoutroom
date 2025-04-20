import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { useAuth } from '@/hooks/use-auth';

// Componente che aggiorna le informazioni utente in Sentry
// Usalo nel layout principale per tracciare l'utente correntemente autenticato
// in modo che gli errori siano associati all'utente specifico
function SentryUser() {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Imposta le informazioni dell'utente per Sentry
      Sentry.setUser({
        id: user.id.toString(),
        username: user.username,
        email: user.email || undefined,
      });
    } else {
      // Se non c'è un utente autenticato, cancella i dati utente 
      Sentry.setUser(null);
    }
  }, [user]);

  // Questo è un componente funzionale che non renderizza nulla
  return null;
}

export default SentryUser;