import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { auth } from '../../../../firebase';
import { Loader2 } from "lucide-react";

/**
 * Componente per proteggere le rotte che richiedono autenticazione
 * Reindirizza l'utente alla pagina di login se non è autenticato
 */
export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        console.log('Utente non autenticato, reindirizzamento a /login');
        router.push('/login');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  // Mostra il loader durante il controllo dell'autenticazione
  if (isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-muted-foreground">Verifica autenticazione...</p>
        </div>
      </div>
    );
  }

  // Renderizza i children solo se l'utente è autenticato
  return isAuthenticated ? children : null;
}