// Script per la registrazione manuale del Service Worker

// Questa funzione registra il service worker e sarà richiamata dal main.tsx
export async function registerSW() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/'
      });
      
      if (registration.installing) {
        console.log('Service worker installing');
      } else if (registration.waiting) {
        console.log('Service worker installed');
      } else if (registration.active) {
        console.log('Service worker active');
      }
      
      // Gestire gli aggiornamenti
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Nuovo service worker è installato ma non attivo ancora
              if (confirm('È disponibile un nuovo aggiornamento. Vuoi riavviare l\'applicazione per applicarlo?')) {
                window.location.reload();
              }
            }
          });
        }
      });
      
      // Controlla gli aggiornamenti ogni ora
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000);
      
    } catch (error) {
      console.error('Service worker registration failed:', error);
    }
  } else {
    console.warn('Service workers are not supported in this browser');
  }
}