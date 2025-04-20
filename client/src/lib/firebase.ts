import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { apiRequest, queryClient } from "./queryClient";

// Verifica se le chiavi Firebase sono presenti
if (!import.meta.env.VITE_FIREBASE_API_KEY || !import.meta.env.VITE_FIREBASE_PROJECT_ID || !import.meta.env.VITE_FIREBASE_APP_ID) {
  console.error('Configurazione Firebase mancante. Assicurati di impostare le variabili d\'ambiente necessarie.');
}

// Configurazione Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Inizializzazione Firebase
const app = initializeApp(firebaseConfig);

// Autenticazione Firebase
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Aggiungiamo alcuni parametri di configurazione per migliorare la compatibilità e il controllo
googleProvider.setCustomParameters({
  prompt: 'select_account',
  login_hint: 'user@example.com',
  // Aggiunta di scopes opzionali per ottenere più informazioni
  scope: 'email profile'
});

// Funzione per elaborare il risultato dell'autenticazione Google
const processGoogleAuthResult = async (user: any) => {
  if (!user) throw new Error('Nessun utente trovato');
  
  console.log('Utente Google autenticato:', user.uid);
  
  // Estrai i dati dell'utente dal risultato
  const userData = {
    username: user.displayName || user.email?.split('@')[0] || '',
    email: user.email || '',
    firebaseUid: user.uid,
    displayName: user.displayName || '',
    photoURL: user.photoURL || '',
  };
  
  try {
    // Invia i dati dell'utente al backend utilizzando apiRequest per mantenere coerenza
    console.log('Invio dati al backend:', userData);
    const response = await apiRequest('POST', '/api/auth/google', userData);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Risposta server non ok:', response.status, errorText);
      throw new Error(`Errore server: ${response.status} - ${errorText}`);
    }
    
    const userResponse = await response.json();
    console.log('Risposta dal backend:', userResponse);
    
    // Importante: aggiorna il query client per riflettere l'utente senza refresh
    queryClient.setQueryData(["/api/user"], userResponse);
    
    return userResponse;
  } catch (error: any) {
    console.error('Errore durante l\'invio dei dati al backend:', error);
    throw new Error(`Errore durante l'autenticazione con Google: ${error.message}`);
  }
};

// Funzione migliorata per il login con Google - preferisce popup ma cade su redirect se necessario
export const signInWithGoogle = async () => {
  console.log('Tentativo di login con Google (popup)...');
  
  try {
    // Prima prova con il popup che è l'esperienza migliore
    const result = await signInWithPopup(auth, googleProvider);
    console.log('Login con Google (popup) riuscito!');
    return await processGoogleAuthResult(result.user);
  } catch (error: any) {
    console.error('Errore durante il login con Google (popup):', error);
    
    // Se l'errore è di tipo unauthorized-domain o popup-blocked, prova con il redirect
    if (error.code === 'auth/unauthorized-domain' || error.code === 'auth/popup-blocked') {
      console.log(`Tentativo con redirect dopo errore: ${error.code}`);
      return signInWithGoogleRedirect();
    }
    
    // Altrimenti propaga l'errore
    throw error;
  }
};

// Login con Google usando redirect (alternativa per dispositivi mobili o problemi di popup)
export const signInWithGoogleRedirect = () => {
  console.log('Avvio login con Google (redirect)...');
  
  // Utilizziamo try-catch anche qui per gestire eventuali errori immediati
  try {
    signInWithRedirect(auth, googleProvider);
    console.log('Reindirizzamento a Google avviato');
    return { redirecting: true }; // Indichiamo che stiamo reindirizzando
  } catch (error) {
    console.error('Errore durante il reindirizzamento Google:', error);
    throw error;
  }
};

// Gestione del risultato del redirect
export const handleGoogleRedirect = async () => {
  console.log('Controllando risultato del redirect...');
  
  try {
    const result = await getRedirectResult(auth);
    if (!result) {
      console.log('Nessun risultato dal redirect');
      return null;
    }
    
    console.log('Risultato dal redirect ottenuto');
    return await processGoogleAuthResult(result.user);
  } catch (error) {
    console.error('Errore durante la gestione del redirect Google:', error);
    throw error;
  }
};

// Utility per estrarre i parametri URL dopo un redirect
export const getUrlParams = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const params: Record<string, string> = {};
  
  for (const [key, value] of searchParams.entries()) {
    params[key] = value;
  }
  
  return params;
};

export { auth, googleProvider };