// Configurazione Firebase in modalità sicura per Next.js
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Config hardcoded semplice per evitare problemi con le variabili d'ambiente
// Questa è una soluzione temporanea per far funzionare il progetto
// In un ambiente di produzione, queste dovrebbero essere variabili d'ambiente
const firebaseConfig = {
  apiKey: "AIzaSyDRnx8IoK9U_7gZVgYPxjXUhb2eknRYyK0",
  authDomain: "ineoutroom.firebaseapp.com",
  projectId: "ineoutroom",
  storageBucket: "ineoutroom.appspot.com",
  messagingSenderId: "724888943157",
  appId: "1:724888943157:web:f06ed5823a8f3679bbcc51"
};

// Inizializzazione Firebase solo se tutte le variabili necessarie sono definite
let app;
let auth;
let db;
let storage;

try {
  if (firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId) {
    // Inizializzazione Firebase
    app = initializeApp(firebaseConfig);
    
    // Inizializzazione servizi
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } else {
    console.warn('Configurazione Firebase incompleta, alcuni servizi non saranno disponibili');
  }
} catch (error) {
  console.error('Errore durante l\'inizializzazione di Firebase:', error);
}

// Esportazione dei servizi Firebase
export { auth, db, storage };
export default app;