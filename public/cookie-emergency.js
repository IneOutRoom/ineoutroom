(function() {
  // Solo se non ci sono già consensi salvati
  try {
    // Verifica se è stato già dato il consenso
    if (localStorage.getItem('cookieConsent') !== null) {
      return;
    }
    
    // Crea un div di emergenza se non esiste già
    if (!document.getElementById('emergency-cookie-banner')) {
      console.log('EMERGENCY BANNER: Creazione banner di emergenza');
      const bannerElement = document.createElement('div');
      bannerElement.id = 'emergency-cookie-banner';
      Object.assign(bannerElement.style, {
        position: 'fixed',
        bottom: '0',
        left: '0',
        width: '100%',
        backgroundColor: 'white',
        zIndex: '999999',
        padding: '15px',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
        borderTop: '1px solid #ddd',
        fontFamily: 'Arial, sans-serif'
      });
      
      bannerElement.innerHTML = `
        <div style="max-width: 1200px; margin: 0 auto;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
            <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #6a0dad;">Preferenze Cookie (Banner Emergenza)</h3>
            <button id="close-emergency-cookie" style="background: none; border: none; cursor: pointer; font-size: 20px;">✕</button>
          </div>
          <p style="margin: 0 0 12px 0; font-size: 14px;">
            Questo sito utilizza i cookie per migliorare la tua esperienza.
          </p>
          <div style="display: flex; gap: 8px; justify-content: flex-end;">
            <button id="reject-emergency-cookie" style="padding: 8px 16px; border: 1px solid #ddd; border-radius: 4px; background-color: white; color: #333; cursor: pointer; font-size: 14px;">Rifiuta</button>
            <button id="accept-emergency-cookie" style="padding: 8px 16px; border: none; border-radius: 4px; background-color: #6a0dad; color: white; cursor: pointer; font-size: 14px;">Accetta tutti</button>
          </div>
        </div>
      `;
      
      // Aggiungi al body
      document.body.appendChild(bannerElement);
      
      // Aggiungi event listeners
      document.getElementById('close-emergency-cookie').addEventListener('click', function() {
        localStorage.setItem('cookieConsent', 'false');
        document.getElementById('emergency-cookie-banner').style.display = 'none';
      });
      
      document.getElementById('reject-emergency-cookie').addEventListener('click', function() {
        localStorage.setItem('cookieConsent', 'false');
        localStorage.setItem('cookiePreferences', JSON.stringify({
          necessary: true, 
          analytics: false, 
          marketing: false, 
          preferences: false
        }));
        document.getElementById('emergency-cookie-banner').style.display = 'none';
      });
      
      document.getElementById('accept-emergency-cookie').addEventListener('click', function() {
        localStorage.setItem('cookieConsent', 'true');
        localStorage.setItem('cookiePreferences', JSON.stringify({
          necessary: true, 
          analytics: true, 
          marketing: true, 
          preferences: true
        }));
        document.getElementById('emergency-cookie-banner').style.display = 'none';
        window.location.reload();
      });
      
      console.log('EMERGENCY BANNER: Banner di emergenza aggiunto al DOM');
    }
  } catch (e) {
    console.error('EMERGENCY BANNER: Errore nel banner cookie di emergenza:', e);
  }
})();