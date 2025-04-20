import { createContext, ReactNode, useContext, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User, InsertUser } from "@shared/schema";
import { 
  getQueryFn, 
  apiRequest, 
  queryClient, 
  isAuthenticated, 
  getAuthToken, 
  setAuthToken, 
  removeAuthToken 
} from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: Omit<User, "password"> | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<Omit<User, "password">, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<Omit<User, "password">, Error, InsertUser>;
};

type LoginData = {
  username: string;
  password: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  // Monitora lo stato di autenticazione tramite localStorage
  useEffect(() => {
    // Verifica iniziale
    const checkAuth = () => {
      const isCurrentlyAuth = isAuthenticated();
      
      // Se non siamo autenticati ma c'è un utente in cache, invalida i dati
      if (!isCurrentlyAuth && queryClient.getQueryData(["/api/user"])) {
        console.log("Token JWT mancante, invalidazione cache utente");
        queryClient.setQueryData(["/api/user"], null);
        queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      }
    };
    
    // Controlla subito
    checkAuth();
    
    // Imposta un listener per eventi di storage (utile per sincronizzare più tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token') {
        checkAuth();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  const {
    data: user,
    error,
    isLoading,
    refetch: refetchUser
  } = useQuery<Omit<User, "password"> | null>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: 1, // Limita i tentativi di retry per evitare troppe richieste in caso di errore
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      
      // Estrai il token JWT dall'header di risposta se presente
      const authHeader = res.headers.get('Authorization') || res.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        setAuthToken(token);
        console.log("Login: JWT token salvato");
      }
      
      return await res.json();
    },
    onSuccess: (user: Omit<User, "password">) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Login effettuato",
        description: "Benvenuto su In&Out!",
      });
    },
    onError: (error: Error) => {
      // In caso di errore di login, rimuovi eventuali token esistenti
      removeAuthToken();
      toast({
        title: "Login fallito",
        description: error.message || "Credenziali non valide",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: InsertUser) => {
      const res = await apiRequest("POST", "/api/register", credentials);
      
      // Estrai il token JWT dall'header di risposta se presente
      const authHeader = res.headers.get('Authorization') || res.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        setAuthToken(token);
        console.log("Registrazione: JWT token salvato");
      }
      
      return await res.json();
    },
    onSuccess: (user: Omit<User, "password"> & { emailSent?: boolean }) => {
      // Se c'è il flag emailSent, non memorizzare l'utente nel contesto
      // poiché richiedere la verifica dell'email prima di considerare l'utente autenticato
      if (!user.emailSent) {
        queryClient.setQueryData(["/api/user"], user);
        toast({
          title: "Registrazione completata",
          description: "Benvenuto su In&Out!",
        });
      } else {
        // Rimuovi il token JWT se è richiesta la verifica email
        removeAuthToken();
        
        // Se è stata inviata un'email di verifica, notifica l'utente ma non autenticarlo ancora
        toast({
          title: "Registrazione completata",
          description: "Ti abbiamo inviato un'email di verifica. Per favore, controlla la tua casella di posta e clicca sul link per attivare il tuo account.",
        });
        
        // Reindirizza alla pagina di login con il flag email_sent
        window.location.href = "/auth?email_sent=true";
      }
    },
    onError: (error: Error) => {
      // In caso di errore di registrazione, rimuovi eventuali token
      removeAuthToken();
      toast({
        title: "Registrazione fallita",
        description: error.message || "Si è verificato un errore",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      // Rimuovi il token JWT per impedire ulteriori richieste autenticate
      removeAuthToken();
      
      // Aggiorna lo store React Query
      queryClient.setQueryData(["/api/user"], null);
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      // Visualizza una notifica di successo all'utente
      toast({
        title: "Logout effettuato",
        description: "Hai effettuato il logout con successo",
      });
      
      // Forza il refresh per assicurarsi che tutte le sessioni siano cancellate
      setTimeout(() => refetchUser(), 300);
    },
    onError: (error: Error) => {
      console.error("Errore durante il logout:", error);
      
      // Anche in caso di errore nel logout lato server, rimuoviamo comunque il token JWT
      // per assicurarci che l'utente non rimanga in uno stato di autenticazione ambiguo
      removeAuthToken();
      queryClient.setQueryData(["/api/user"], null);
      
      toast({
        title: "Logout fallito",
        description: error.message || "Si è verificato un errore durante il logout",
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        error: error as Error | null,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
