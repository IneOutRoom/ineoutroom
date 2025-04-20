// Script per il consenso cookie che viene caricato immediatamente

(function() {
  function checkCookieConsent() {
    try {
      var hasConsent = localStorage.getItem('cookie-consent');
      if (!hasConsent) {
        showCookieBanner();
      }
    } catch (e) {
      console.error('Error checking cookie consent:', e);
    }
  }

  function showCookieBanner() {
    // Verifica se il banner è già presente
    if (document.getElementById('cookie-banner-container')) {
      return;
    }
    
    // Crea il banner di base
    var container = document.createElement('div');
    container.id = 'cookie-banner-container';
    container.style.position = 'fixed';
    container.style.bottom = '0';
    container.style.left = '0';
    container.style.right = '0';
    container.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
    container.style.backdropFilter = 'blur(4px)';
    container.style.padding = '16px';
    container.style.zIndex = '9999';
    
    var banner = document.createElement('div');
    banner.style.maxWidth = '1000px';
    banner.style.margin = '0 auto';
    banner.style.backgroundColor = 'white';
    banner.style.borderRadius = '8px';
    banner.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    banner.style.padding = '16px';
    banner.style.display = 'flex';
    banner.style.flexDirection = 'column';
    
    var header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'flex-start';
    header.style.marginBottom = '10px';
    
    var titleDiv = document.createElement('div');
    
    var title = document.createElement('h3');
    title.textContent = 'Preferenze Cookie';
    title.style.margin = '0';
    title.style.fontSize = '18px';
    title.style.fontWeight = 'bold';
    title.style.color = '#6a0dad';
    
    var subtitle = document.createElement('p');
    subtitle.textContent = 'Utilizziamo i cookie per migliorare la tua esperienza sul nostro sito';
    subtitle.style.margin = '4px 0 0 0';
    subtitle.style.fontSize = '14px';
    subtitle.style.color = '#666';
    
    titleDiv.appendChild(title);
    titleDiv.appendChild(subtitle);
    
    var closeButton = document.createElement('button');
    closeButton.textContent = '✕';
    closeButton.style.background = 'transparent';
    closeButton.style.border = 'none';
    closeButton.style.fontSize = '16px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.padding = '4px 8px';
    closeButton.style.borderRadius = '50%';
    closeButton.onclick = function() {
      rejectAll();
    };
    
    header.appendChild(titleDiv);
    header.appendChild(closeButton);
    
    var content = document.createElement('div');
    content.style.marginBottom = '16px';
    
    var text = document.createElement('p');
    text.innerHTML = 'Questo sito utilizza i cookie per migliorare la tua esperienza, personalizzare contenuti e annunci, ' +
      'fornire funzionalità di social media e analizzare il nostro traffico. Puoi scegliere se accettare tutti i cookie, ' +
      'solo quelli necessari o personalizzare le tue preferenze. Per maggiori informazioni, consulta la nostra ' +
      '<a href="/cookie-policy" style="color: #6a0dad; text-decoration: none; font-weight: 500;">Informativa sulla Privacy</a>.';
    text.style.fontSize = '14px';
    text.style.lineHeight = '1.5';
    text.style.margin = '0';
    
    content.appendChild(text);
    
    var footer = document.createElement('div');
    footer.style.display = 'flex';
    footer.style.justifyContent = 'space-between';
    footer.style.borderTop = '1px solid #eee';
    footer.style.paddingTop = '16px';
    
    var leftButtons = document.createElement('div');
    leftButtons.style.display = 'flex';
    leftButtons.style.gap = '8px';
    
    var customizeButton = document.createElement('button');
    customizeButton.textContent = 'Personalizza';
    customizeButton.style.padding = '8px 16px';
    customizeButton.style.border = '1px solid #ddd';
    customizeButton.style.borderRadius = '4px';
    customizeButton.style.backgroundColor = 'white';
    customizeButton.style.fontSize = '14px';
    customizeButton.style.cursor = 'pointer';
    customizeButton.onclick = function() {
      // Idealmente qui mostreremmo le opzioni di personalizzazione, 
      // ma per semplicità reindirizzamo alla pagina cookie policy
      window.location.href = '/cookie-policy';
    };
    
    var rejectButton = document.createElement('button');
    rejectButton.textContent = 'Rifiuta tutti';
    rejectButton.style.padding = '8px 16px';
    rejectButton.style.border = '1px solid #ddd';
    rejectButton.style.borderRadius = '4px';
    rejectButton.style.backgroundColor = 'white';
    rejectButton.style.fontSize = '14px';
    rejectButton.style.cursor = 'pointer';
    rejectButton.onclick = function() {
      rejectAll();
    };
    
    leftButtons.appendChild(customizeButton);
    leftButtons.appendChild(rejectButton);
    
    var acceptButton = document.createElement('button');
    acceptButton.textContent = 'Accetta tutti';
    acceptButton.style.padding = '8px 16px';
    acceptButton.style.border = 'none';
    acceptButton.style.borderRadius = '4px';
    acceptButton.style.backgroundColor = '#6a0dad';
    acceptButton.style.color = 'white';
    acceptButton.style.fontSize = '14px';
    acceptButton.style.cursor = 'pointer';
    acceptButton.onclick = function() {
      acceptAll();
    };
    
    footer.appendChild(leftButtons);
    footer.appendChild(acceptButton);
    
    banner.appendChild(header);
    banner.appendChild(content);
    banner.appendChild(footer);
    container.appendChild(banner);
    
    document.body.appendChild(container);
  }

  function acceptAll() {
    var allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };
    
    localStorage.setItem('cookie-consent', 'true');
    localStorage.setItem('cookie-preferences', JSON.stringify(allAccepted));
    
    hideBanner();
  }

  function rejectAll() {
    var allRejected = {
      necessary: true, // I cookie necessari sono sempre abilitati
      analytics: false,
      marketing: false,
      preferences: false,
    };
    
    localStorage.setItem('cookie-consent', 'true');
    localStorage.setItem('cookie-preferences', JSON.stringify(allRejected));
    
    removeCookies(['_ga', '_gid', '_gat', '_fbp', 'ads_id', '_gcl_au', 'language', 'recent_searches', 'display_settings']);
    
    hideBanner();
  }

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

  function hideBanner() {
    var banner = document.getElementById('cookie-banner-container');
    if (banner) {
      banner.remove();
    }
  }

  // Attendi che il documento sia caricato
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkCookieConsent);
  } else {
    checkCookieConsent();
  }
})();