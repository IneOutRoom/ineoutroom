// Soluzione robusta per il consenso cookie che garantisce la visualizzazione

(function() {
  // Funzione per controllare se il consenso cookie è stato fornito
  function checkCookieConsent() {
    try {
      // Verifica se c'è già il consenso
      var hasConsent = localStorage.getItem('cookie-consent');
      if (!hasConsent) {
        injectBanner();
      }
    } catch (e) {
      console.error('Error checking cookie consent:', e);
      // In caso di errore, mostro comunque il banner per sicurezza
      injectBanner();
    }
  }

  // Funzione per iniettare il banner nel DOM
  function injectBanner() {
    // Evita duplicati
    if (document.getElementById('cookie-banner-container')) {
      return;
    }
    
    // Carica il banner HTML da un file esterno
    fetch('/cookie-banner.html')
      .then(function(response) {
        return response.text();
      })
      .then(function(html) {
        // Crea un container temporaneo
        var div = document.createElement('div');
        div.innerHTML = html;
        
        // Aggiungi il banner al body
        document.body.appendChild(div.firstChild);
        
        // Definisci le funzioni di interazione globalmente
        window.acceptCookies = acceptCookies;
        window.rejectCookies = rejectCookies;
      })
      .catch(function(error) {
        console.error('Error loading cookie banner:', error);
        // Fallback in caso di errore nel caricamento: crea direttamente il banner
        createMinimalBanner();
      });
  }

  // Crea un banner minimo in caso di fallimento del caricamento
  function createMinimalBanner() {
    var banner = document.createElement('div');
    banner.id = 'cookie-banner-container';
    banner.style.position = 'fixed';
    banner.style.bottom = '0';
    banner.style.left = '0';
    banner.style.right = '0';
    banner.style.backgroundColor = '#f8f9fa';
    banner.style.padding = '15px';
    banner.style.boxShadow = '0 -2px 10px rgba(0, 0, 0, 0.1)';
    banner.style.zIndex = '9999';
    banner.style.textAlign = 'center';
    
    banner.innerHTML = '<div><p style="margin-bottom: 10px;">Questo sito utilizza i cookie per migliorare la tua esperienza. ' +
      'Accetti l\'utilizzo dei cookie?</p>' +
      '<button onclick="acceptCookies()" style="margin-right: 10px; padding: 5px 10px; background-color: #6a0dad; color: white; border: none; border-radius: 4px; cursor: pointer;">Accetta</button>' +
      '<button onclick="rejectCookies()" style="padding: 5px 10px; background-color: #f8f9fa; border: 1px solid #ccc; border-radius: 4px; cursor: pointer;">Rifiuta</button></div>';
    
    document.body.appendChild(banner);
    
    window.acceptCookies = acceptCookies;
    window.rejectCookies = rejectCookies;
  }

  // Funzione per accettare tutti i cookie
  function acceptCookies() {
    localStorage.setItem('cookie-consent', 'true');
    localStorage.setItem('cookie-preferences', JSON.stringify({
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    }));
    
    removeBanner();
  }

  // Funzione per rifiutare i cookie non necessari
  function rejectCookies() {
    localStorage.setItem('cookie-consent', 'true');
    localStorage.setItem('cookie-preferences', JSON.stringify({
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    }));
    
    // Rimuove i cookie non necessari
    removeCookies(['_ga', '_gid', '_gat', '_fbp', 'ads_id', '_gcl_au', 'language', 'recent_searches', 'display_settings']);
    
    removeBanner();
  }

  // Funzione per rimuovere i cookie specificati
  function removeCookies(cookieNames) {
    var domain = window.location.hostname;
    var paths = ['/', '/search', '/properties', '/auth'];
    
    cookieNames.forEach(function(name) {
      paths.forEach(function(path) {
        document.cookie = name + '=; domain=' + domain + '; path=' + path + '; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = name + '=; path=' + path + '; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      });
    });
  }

  // Funzione per rimuovere il banner
  function removeBanner() {
    var banner = document.getElementById('cookie-banner-container');
    if (banner) {
      banner.remove();
    }
  }

  // Definisci le funzioni a livello di window per renderle accessibili dal banner
  window.acceptCookies = acceptCookies;
  window.rejectCookies = rejectCookies;

  // Verifica il consenso cookie quando il documento è pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(checkCookieConsent, 1000); // Ritardo per assicurarsi che il DOM sia pronto
    });
  } else {
    setTimeout(checkCookieConsent, 1000);
  }
  
  // Fallback: verifica sempre il consenso dopo 2 secondi dal caricamento
  setTimeout(checkCookieConsent, 2000);
})();