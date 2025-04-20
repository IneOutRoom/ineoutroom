import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Tenta di recuperare il token JWT da localStorage (se disponibile)
export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
}

// Salva il token JWT in localStorage (se disponibile)
export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
  }
}

// Rimuove il token JWT da localStorage (se disponibile)
export function removeAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  options?: RequestInit
): Promise<Response> {
  // Preparazione degli headers di base
  const headers: Record<string, string> = data ? { "Content-Type": "application/json" } : {};
  
  // Aggiunta del token JWT all'header Authorization se disponibile
  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include", // Mantiene i cookie di sessione
    ...options
  });

  // Non chiamiamo automaticamente throwIfResNotOk per permettere di gestire gli errori manualmente
  // quando necessario (es. nei componenti AI dove abbiamo bisogno di esaminare i dettagli dell'errore)
  if (!options || !options.signal) {
    await throwIfResNotOk(res);
  }
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";

// Verifica stato di autenticazione prima di tentare una query
export function isAuthenticated(): boolean {
  return !!getAuthToken() || document.cookie.includes('inout.sid=');
}

export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Prepariamo le opzioni di fetch
    const headers: Record<string, string> = {};
    
    // Aggiungiamo il token JWT se disponibile
    const token = getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    
    // Se l'endpoint è /api/user e sappiamo già che non siamo autenticati,
    // evita la chiamata REST e restituisci direttamente null
    if (
      queryKey[0] === "/api/user" && 
      unauthorizedBehavior === "returnNull" && 
      !isAuthenticated()
    ) {
      console.log("Evitata chiamata inutile a /api/user (utente non autenticato)");
      return null;
    }
    
    const res = await fetch(queryKey[0] as string, {
      credentials: "include", // Per i cookie di sessione
      headers
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      // Pulisci token se presente ma non valido (401)
      if (token) {
        console.log("Token JWT non valido o scaduto, rimosso");
        removeAuthToken();
      }
      return null;
    }

    await throwIfResNotOk(res);
    
    // Controlla se c'è un header Authorization nella risposta e salvalo
    const authHeader = res.headers.get('Authorization') || res.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const newToken = authHeader.substring(7);
      setAuthToken(newToken);
      console.log("Nuovo token JWT salvato");
    }
    
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
