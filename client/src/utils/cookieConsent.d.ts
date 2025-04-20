// Dichiarazione di tipi per il modulo cookieConsent.js

declare module '../../utils/cookieConsent' {
  export interface CookiePreferences {
    necessary: boolean;
    analytics: boolean;
    marketing: boolean;
    preferences: boolean;
  }

  /**
   * Ottiene lo stato del consenso cookie
   * @returns {boolean | null} true se l'utente ha accettato, false se ha rifiutato, null se non ha ancora scelto
   */
  export function getConsent(): boolean | null;
  
  /**
   * Imposta lo stato del consenso cookie
   * @param {boolean} value - true per accettare, false per rifiutare
   */
  export function setConsent(value: boolean): void;
  
  /**
   * Ottiene le preferenze dettagliate sui cookie
   * @returns {CookiePreferences | null} Le preferenze o null se non sono state impostate
   */
  export function getConsentPreferences(): CookiePreferences | null;
  
  /**
   * Imposta le preferenze dettagliate sui cookie
   * @param {Partial<CookiePreferences>} preferences - Le preferenze da impostare
   */
  export function setConsentPreferences(preferences: Partial<CookiePreferences>): void;
  
  /**
   * Rimuove i cookie non necessari
   */
  export function removeCookies(): void;
}