/**
 * Utility per la gestione del consenso cookie
 * Implementa funzioni per ottenere e impostare il consenso ai cookie
 */

// Recupera lo stato del consenso dai cookie
export function getConsent() {
  if (typeof window === 'undefined') return null; // SSR check
  return localStorage.getItem('cookieConsent') === null
    ? null
    : localStorage.getItem('cookieConsent') === 'true';
}

// Imposta lo stato del consenso nei cookie
export function setConsent(value) {
  if (typeof window === 'undefined') return; // SSR check
  localStorage.setItem('cookieConsent', value ? 'true' : 'false');
}

// Ottiene le preferenze dettagliate sui cookie
export function getConsentPreferences() {
  if (typeof window === 'undefined') return null;
  
  const preferences = localStorage.getItem('cookiePreferences');
  if (!preferences) return null;
  
  try {
    return JSON.parse(preferences);
  } catch (e) {
    console.error('Errore nel parsing delle preferenze cookie:', e);
    return null;
  }
}

// Imposta le preferenze dettagliate sui cookie
export function setConsentPreferences(preferences) {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('cookiePreferences', JSON.stringify({
    necessary: true, // I cookie necessari sono sempre accettati
    ...preferences
  }));
}

// Rimuove i cookie non necessari quando l'utente rifiuta il consenso
export function removeCookies() {
  if (typeof window === 'undefined') return;
  
  const cookieNames = ['_ga', '_gid', '_gat', '_fbp', '_fbc', 'ads_id', '_gcl_au'];
  const domain = window.location.hostname;
  const paths = ['/', '/search', '/properties', '/auth', '/profile'];
  
  cookieNames.forEach(name => {
    paths.forEach(path => {
      document.cookie = `${name}=; domain=${domain}; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      document.cookie = `${name}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    });
  });
}