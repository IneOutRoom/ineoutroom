import { Workbox } from 'workbox-window';

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    const wb = new Workbox('/service-worker.js');

    // Aggiungere il gestore per gli aggiornamenti
    wb.addEventListener('waiting', (event) => {
      // Esempio di notifica all'utente
      if (window.confirm('È disponibile un nuovo aggiornamento. Vuoi ricaricare per aggiornare?')) {
        wb.messageSkipWaiting();
      }
    });

    wb.addEventListener('controlling', () => {
      window.location.reload();
    });

    // Register the service worker
    wb.register()
      .then((registration) => {
        console.log('Service Worker registrato con successo:', registration);
      })
      .catch((error) => {
        console.error('Errore durante la registrazione del Service Worker:', error);
      });
  } else {
    console.warn('Service Worker non supportato in questo browser');
  }
}