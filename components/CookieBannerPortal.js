import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

// Componente per il banner cookie
function CookieBanner() {
  // Handlers
  const handleClose = () => {
    localStorage.setItem('cookieConsent', 'false');
    window.location.reload();
  };
  
  const handleReject = () => {
    localStorage.setItem('cookieConsent', 'false');
    localStorage.setItem('cookiePreferences', JSON.stringify({
      necessary: true, 
      analytics: false, 
      marketing: false, 
      preferences: false
    }));
    window.location.reload();
  };
  
  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'true');
    localStorage.setItem('cookiePreferences', JSON.stringify({
      necessary: true, 
      analytics: true, 
      marketing: true, 
      preferences: true
    }));
    window.location.reload();
  };

  return (
    <div className="cookie-banner">
      <div style={{maxWidth: '1200px', margin: '0 auto', padding: '15px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '12px'}}>
          <h3 style={{margin: 0, fontSize: '18px', fontWeight: 600, color: '#6a0dad'}}>Preferenze Cookie</h3>
          <button 
            onClick={handleClose}
            style={{background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px'}}
          >✕</button>
        </div>
        <p style={{margin: '0 0 12px 0', fontSize: '14px'}}>
          Questo sito utilizza i cookie per migliorare la tua esperienza, personalizzare contenuti e analizzare il traffico. 
          Puoi scegliere se accettare tutti i cookie o personalizzare le tue preferenze.
        </p>
        <div style={{display: 'flex', gap: '8px', justifyContent: 'flex-end'}}>
          <a href="/legal-cookies" style={{display: 'inline-block', padding: '8px 16px', border: '1px solid #ddd', borderRadius: '4px', textDecoration: 'none', color: '#333', fontSize: '14px'}}>Maggiori info</a>
          <button 
            onClick={handleReject}
            style={{padding: '8px 16px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: 'white', color: '#333', cursor: 'pointer', fontSize: '14px'}}
          >Rifiuta</button>
          <button 
            onClick={handleAccept}
            style={{padding: '8px 16px', border: 'none', borderRadius: '4px', backgroundColor: '#6a0dad', color: 'white', cursor: 'pointer', fontSize: '14px'}}
          >Accetta tutti</button>
        </div>
      </div>
    </div>
  );
}

export default function CookieBannerPortal() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    console.log('CookieBannerPortal montato');
    
    // Verifica immediata in useEffect per garantire che funzioni lato client
    if (typeof document !== 'undefined') {
      // Prova ad inserire direttamente un div di fallback nel body se non troviamo quello dedicato
      const cookieRoot = document.getElementById('cookie-root') || document.body;
      
      // Se l'utente non ha ancora dato il consenso, mostra il banner
      if (localStorage.getItem('cookieConsent') === null) {
        // Crea un div di fallback se non esiste già
        if (!document.getElementById('cookie-banner-fallback')) {
          const bannerElement = document.createElement('div');
          bannerElement.id = 'cookie-banner-fallback';
          bannerElement.style.position = 'fixed';
          bannerElement.style.bottom = '0';
          bannerElement.style.left = '0';
          bannerElement.style.width = '100%';
          bannerElement.style.backgroundColor = 'white';
          bannerElement.style.zIndex = '99999';
          bannerElement.style.padding = '15px';
          bannerElement.style.boxShadow = '0 -2px 10px rgba(0,0,0,0.1)';
          bannerElement.style.borderTop = '1px solid #ddd';
          
          bannerElement.innerHTML = `
            <div style="max-width: 1200px; margin: 0 auto;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #6a0dad;">Preferenze Cookie</h3>
                <button id="close-cookie-banner" style="background: none; border: none; cursor: pointer; font-size: 20px;">✕</button>
              </div>
              <p style="margin: 0 0 12px 0; font-size: 14px;">
                Questo sito utilizza i cookie per migliorare la tua esperienza, personalizzare contenuti e analizzare il traffico. 
                Puoi scegliere se accettare tutti i cookie o personalizzare le tue preferenze.
              </p>
              <div style="display: flex; gap: 8px; justify-content: flex-end;">
                <a href="/legal-cookies" style="display: inline-block; padding: 8px 16px; border: 1px solid #ddd; border-radius: 4px; text-decoration: none; color: #333; font-size: 14px;">Maggiori info</a>
                <button id="reject-cookie-banner" style="padding: 8px 16px; border: 1px solid #ddd; border-radius: 4px; background-color: white; color: #333; cursor: pointer; font-size: 14px;">Rifiuta</button>
                <button id="accept-cookie-banner" style="padding: 8px 16px; border: none; border-radius: 4px; background-color: #6a0dad; color: white; cursor: pointer; font-size: 14px;">Accetta tutti</button>
              </div>
            </div>
          `;
          
          // Aggiungi il banner al body
          cookieRoot.appendChild(bannerElement);
          
          // Aggiungi event listeners
          document.getElementById('close-cookie-banner').addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'false');
            document.getElementById('cookie-banner-fallback').style.display = 'none';
          });
          
          document.getElementById('reject-cookie-banner').addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'false');
            localStorage.setItem('cookiePreferences', JSON.stringify({
              necessary: true, 
              analytics: false, 
              marketing: false, 
              preferences: false
            }));
            document.getElementById('cookie-banner-fallback').style.display = 'none';
          });
          
          document.getElementById('accept-cookie-banner').addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'true');
            localStorage.setItem('cookiePreferences', JSON.stringify({
              necessary: true, 
              analytics: true, 
              marketing: true, 
              preferences: true
            }));
            document.getElementById('cookie-banner-fallback').style.display = 'none';
            window.location.reload();
          });
        }
      }
    }
    
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Solo nel lato client possiamo usare il portal
  if (!mounted || typeof window === 'undefined') return null;

  // Verifica se il consenso è già stato dato
  const hasConsentStored = localStorage.getItem('cookieConsent') !== null;
  console.log('CookieBannerPortal - hasConsentStored:', hasConsentStored);
  
  // Se c'è già il consenso, non mostrare il banner React
  if (hasConsentStored) return null;

  // Usa il target element dedicato
  const cookieRoot = document.getElementById('cookie-root');
  
  // Se non troviamo l'elemento di destinazione, non renderiamo nulla tramite React Portal
  // Ma abbiamo già aggiunto il banner di fallback nell'useEffect
  if (!cookieRoot) {
    console.error('CookieBannerPortal - elemento #cookie-root non trovato');
    return null;
  }

  // React Portal è solo un tentativo aggiuntivo, già abbiamo il fallback DOM
  return createPortal(<CookieBanner />, cookieRoot);
}