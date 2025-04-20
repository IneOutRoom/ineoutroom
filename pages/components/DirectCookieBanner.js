import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DirectCookieBanner() {
  const [show, setShow] = useState(false);
  
  useEffect(() => {
    // Verifica se il consenso è già stato dato
    if (typeof window !== 'undefined') {
      const hasConsent = localStorage.getItem('cookie-consent');
      if (!hasConsent) {
        setShow(true);
      }
    }
  }, []);

  // Accetta tutti i cookie
  const acceptAll = () => {
    localStorage.setItem('cookie-consent', 'true');
    localStorage.setItem('cookie-preferences', JSON.stringify({
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true
    }));
    setShow(false);
  };

  // Rifiuta tutti i cookie eccetto quelli necessari
  const rejectAll = () => {
    localStorage.setItem('cookie-consent', 'true');
    localStorage.setItem('cookie-preferences', JSON.stringify({
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false
    }));
    
    // Rimuove i cookie non necessari
    const cookieNames = ['_ga', '_gid', '_gat', '_fbp', 'ads_id', '_gcl_au'];
    const domain = window.location.hostname;
    const paths = ['/', '/search', '/properties', '/auth'];
    
    cookieNames.forEach(name => {
      paths.forEach(path => {
        document.cookie = `${name}=; domain=${domain}; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        document.cookie = `${name}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      });
    });
    
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-black/5 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="p-4 flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-primary">Preferenze Cookie</h3>
            <p className="text-sm text-gray-500">Utilizziamo i cookie per migliorare la tua esperienza sul nostro sito</p>
          </div>
          <button 
            onClick={rejectAll}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className="px-4 pb-2">
          <p className="text-sm text-gray-600">
            Questo sito utilizza i cookie per migliorare la tua esperienza, personalizzare contenuti e annunci,
            fornire funzionalità di social media e analizzare il nostro traffico. Per maggiori informazioni, consulta la nostra
            <Link href="/cookie-policy" className="text-primary hover:underline ml-1">
              Informativa sulla Privacy
            </Link>.
          </p>
        </div>
        
        <div className="flex justify-between p-4 border-t">
          <div className="flex gap-2">
            <Link href="/cookie-policy">
              <button className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                Personalizza
              </button>
            </Link>
            <button 
              onClick={rejectAll}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Rifiuta tutti
            </button>
          </div>
          <button 
            onClick={acceptAll}
            className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:opacity-90"
          >
            Accetta tutti
          </button>
        </div>
      </div>
    </div>
  );
}