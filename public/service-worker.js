// Service Worker per In&Out PWA
// Version: 3.0 - Aprile 2025 - Ottimizzato per performance, offline e risparmio dati

// Versione cache
const CACHE_VERSION = 'v3';
const CACHE_NAME = `inout-cache-${CACHE_VERSION}`;
const ASSETS_CACHE = `inout-assets-${CACHE_VERSION}`;
const API_CACHE = `inout-api-${CACHE_VERSION}`;
const IMAGES_CACHE = `inout-images-${CACHE_VERSION}`;
const FONTS_CACHE = `inout-fonts-${CACHE_VERSION}`;

// Risorse core da precaricare (necessarie per il funzionamento offline)
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/favicon.png',
  '/icons/favicon.svg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/offline.html',
  '/styles/main.css',
  '/src/main.tsx'
];

// Gestione dell'installazione del SW
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// Gestione dell'attivazione (per pulire vecchie cache)
self.addEventListener('activate', (event) => {
  const currentCaches = [CACHE_NAME, ASSETS_CACHE, API_CACHE, IMAGES_CACHE, FONTS_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return cacheNames.filter((cacheName) => !currentCaches.includes(cacheName));
    }).then((cachesToDelete) => {
      return Promise.all(cachesToDelete.map((cacheToDelete) => {
        console.log('Service Worker: Pulizia vecchia cache:', cacheToDelete);
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

// Strategia Cache-First per immagini e asset statici
const cacheFirstResources = [
  /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
  /\.(?:css|js)$/,
  /\/icons\//,
  /\/images\//
];

// Strategia Network-First per le richieste API
const networkFirstResources = [
  /\/api\//
];

// Gestione delle richieste fetch
self.addEventListener('fetch', (event) => {
  // Skip richieste cross-origin
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Ignora richieste non GET
  if (event.request.method !== 'GET') {
    return;
  }

  const requestUrl = new URL(event.request.url);

  // Cache First per asset statici
  const isStaticAsset = cacheFirstResources.some(pattern => pattern.test(requestUrl.pathname));
  if (isStaticAsset) {
    event.respondWith(cacheFirstStrategy(event.request));
    return;
  }

  // Network First per API
  const isApiRequest = networkFirstResources.some(pattern => pattern.test(requestUrl.pathname));
  if (isApiRequest) {
    event.respondWith(networkFirstStrategy(event.request));
    return;
  }

  // Strategia di default: Stale-While-Revalidate
  event.respondWith(staleWhileRevalidateStrategy(event.request));
});

// Implementazione delle strategie di caching

// Cache First: tenta prima dalla cache, poi dalla rete
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  return fetchAndCache(request);
}

// Network First: tenta prima dalla rete, cache come fallback
async function networkFirstStrategy(request) {
  try {
    const response = await fetch(request);
    await updateCache(request, response.clone());
    return response;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Stale While Revalidate: usa la cache mentre aggiorna in background
async function staleWhileRevalidateStrategy(request) {
  // Cerca nella cache
  const cachedResponse = await caches.match(request);
  
  // Prendi dalla rete indipendentemente (per aggiornare la cache)
  const fetchPromise = fetch(request)
    .then(networkResponse => {
      // Se abbiamo una risposta valida, aggiorna la cache
      if (networkResponse && networkResponse.ok) {
        updateCache(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(error => {
      console.error('Service worker fetch error:', error);
    });
  
  // Restituisci immediatamente la cache se disponibile
  return cachedResponse || fetchPromise;
}

// Funzioni di supporto
async function fetchAndCache(request) {
  try {
    const response = await fetch(request);
    // Memorizza nella cache solo risposte valide
    if (response && response.status === 200) {
      await updateCache(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('Service worker fetch error:', error);
    throw error;
  }
}

async function updateCache(request, response) {
  // Memorizza nella cache solo le risposte valide
  if (!response || response.status !== 200) {
    return;
  }
  
  // Determina quale cache utilizzare in base al tipo di risorsa
  let cacheName = CACHE_NAME;
  const url = request.url;
  
  if (/\.(jpe?g|png|gif|svg|webp)/.test(url)) {
    cacheName = IMAGES_CACHE;
  } else if (/\.(woff2?|ttf|eot)/.test(url) || url.includes('fonts.googleapis') || url.includes('fonts.gstatic')) {
    cacheName = FONTS_CACHE;
  } else if (/\.(js|css)/.test(url)) {
    cacheName = ASSETS_CACHE;
  } else if (url.includes('/api/')) {
    cacheName = API_CACHE;
  }
  
  // Apri la cache appropriata
  const cache = await caches.open(cacheName);
  
  // Aggiungi alla cache con gestione degli errori
  try {
    await cache.put(request, response);
  } catch (error) {
    console.error(`Errore durante il caching di ${url} in ${cacheName}:`, error);
  }
}

// Aggiungiamo un listener per sincronizzazione in background
self.addEventListener('sync', event => {
  if (event.tag === 'sync-new-listings') {
    event.waitUntil(syncNewListings());
  } else if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages());
  }
});

// Sincronizza nuovi annunci in background quando torna online
async function syncNewListings() {
  try {
    const response = await fetch('/api/listings/sync-pending');
    return response;
  } catch (error) {
    console.error('Errore durante la sincronizzazione degli annunci:', error);
  }
}

// Sincronizza messaggi in background quando torna online
async function syncMessages() {
  try {
    const response = await fetch('/api/messages/sync-pending');
    return response;
  } catch (error) {
    console.error('Errore durante la sincronizzazione dei messaggi:', error);
  }
}