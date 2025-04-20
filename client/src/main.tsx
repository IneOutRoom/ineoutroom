import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { registerSW } from "./pwa/sw-register";

const root = document.getElementById("root");
if (!root) {
  throw new Error("Root element not found");
}

createRoot(root).render(<App />);

// Registra il service worker dopo il rendering dell'applicazione
if (import.meta.env.PROD) {
  // Solo in produzione per evitare problemi durante lo sviluppo
  registerSW();
}
