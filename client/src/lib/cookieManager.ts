interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

const defaultPreferences: CookiePreferences = {
  necessary: true, // I cookie necessari sono sempre abilitati
  analytics: false,
  marketing: false,
  preferences: false,
};

/**
 * CookieManager - Gestisce le preferenze dei cookie e il loro consenso
 */
export const CookieManager = {
  /**
   * Verifica se l'utente ha fornito il consenso ai cookie
   */
  hasConsent(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('cookie-consent') === 'true';
  },

  /**
   * Ottiene le preferenze cookie dell'utente
   */
  getPreferences(): CookiePreferences {
    if (typeof window === 'undefined') return defaultPreferences;
    try {
      const savedPreferences = localStorage.getItem('cookie-preferences');
      if (savedPreferences) {
        return JSON.parse(savedPreferences);
      }
    } catch (e) {
      console.error('Errore nel recupero delle preferenze cookie:', e);
    }
    return defaultPreferences;
  },

  /**
   * Salva le preferenze cookie dell'utente
   */
  savePreferences(preferences: CookiePreferences): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('cookie-consent', 'true');
    localStorage.setItem('cookie-preferences', JSON.stringify(preferences));
    
    // Applica le preferenze rimuovendo i cookie non consentiti
    this.applyPreferences(preferences);
  },

  /**
   * Applica le preferenze cookie rimuovendo i cookie non consentiti
   */
  applyPreferences(preferences: CookiePreferences): void {
    if (typeof window === 'undefined') return;
    
    // Rimuove i cookie analitici se non consentiti
    if (!preferences.analytics) {
      this.removeCookies(['_ga', '_gid', '_gat']);
    }
    
    // Rimuove i cookie di marketing se non consentiti
    if (!preferences.marketing) {
      this.removeCookies(['_fbp', 'ads_id', '_gcl_au']);
    }
    
    // Rimuove i cookie di preferenze se non consentiti
    if (!preferences.preferences) {
      this.removeCookies(['language', 'recent_searches', 'display_settings']);
    }
  },

  /**
   * Rimuove i cookie specificati
   */
  removeCookies(cookieNames: string[]): void {
    if (typeof window === 'undefined') return;
    
    const domain = window.location.hostname;
    const paths = ['/', '/search', '/properties', '/auth'];
    
    cookieNames.forEach(name => {
      // Rimuove il cookie per tutti i possibili path
      paths.forEach(path => {
        document.cookie = `${name}=; domain=${domain}; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        document.cookie = `${name}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      });
    });
  },

  /**
   * Controlla se un tipo specifico di cookie è consentito
   */
  isAllowed(type: keyof CookiePreferences): boolean {
    // I cookie necessari sono sempre consentiti
    if (type === 'necessary') return true;
    
    // Se non c'è consenso, solo i cookie necessari sono consentiti
    if (!this.hasConsent()) return false;
    
    // Altrimenti controlla le preferenze salvate
    return this.getPreferences()[type];
  },
};