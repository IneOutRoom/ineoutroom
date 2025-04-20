import { useState, useEffect } from 'react';
import { getConsent, setConsent, setConsentPreferences, removeCookies } from '../../utils/cookieConsent';
import Link from 'next/link';

export default function CookieBanner() {
  const [show, setShow] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false
  });

  useEffect(() => {
    // Mostra il banner solo se il consenso non è stato ancora dato
    const timer = setTimeout(() => {
      if (getConsent() === null) {
        setShow(true);
      }
    }, 1000); // Ritardo per evitare flickering durante il caricamento

    return () => clearTimeout(timer);
  }, []);

  // Accetta tutti i cookie
  const acceptAll = () => {
    setConsent(true);
    setConsentPreferences({
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true
    });
    setShow(false);
    // Ricarica la pagina per attivare gli script di tracciamento
    window.location.reload();
  };

  // Rifiuta i cookie non necessari
  const rejectAll = () => {
    setConsent(false);
    setConsentPreferences({
      necessary: true, // I cookie necessari sono sempre abilitati
      analytics: false,
      marketing: false,
      preferences: false
    });
    // Rimuove i cookie di tracciamento esistenti
    removeCookies();
    setShow(false);
  };

  // Salva le preferenze personalizzate
  const savePreferences = () => {
    setConsent(true);
    setConsentPreferences(preferences);
    if (!preferences.analytics && !preferences.marketing && !preferences.preferences) {
      removeCookies();
    } else {
      // Ricarica solo se sono stati abilitati analytics o marketing
      window.location.reload();
    }
    setShow(false);
  };

  // Mostra dettagli per personalizzare
  const showCustomizeOptions = () => {
    setShowDetails(true);
  };

  // Gestisci il cambio delle preferenze
  const handlePreferenceChange = (key: string) => {
    setPreferences({
      ...preferences,
      [key]: !preferences[key as keyof typeof preferences]
    });
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-black/5 backdrop-blur-sm" data-cookie-banner="true" id="cookie-banner">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="p-4 flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-primary">Preferenze Cookie</h3>
            <p className="text-sm text-gray-500">Utilizziamo i cookie per migliorare la tua esperienza sul nostro sito</p>
          </div>
          <button 
            onClick={rejectAll}
            className="p-1 rounded-full hover:bg-gray-100"
            aria-label="Chiudi"
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
            fornire funzionalità di social media e analizzare il nostro traffico. Puoi scegliere se accettare tutti i cookie,
            solo quelli necessari o personalizzare le tue preferenze. Per maggiori informazioni, consulta la nostra{' '}
            <Link href="/legal-cookies" className="text-primary hover:underline">
              Informativa sulla Privacy
            </Link>.
          </p>
        </div>

        {showDetails && (
          <div className="px-4 py-3 border-t border-b">
            <h4 className="font-semibold mb-2">Personalizza le preferenze</h4>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.necessary}
                    disabled={true}
                    className="mr-2"
                  />
                  <span className="text-sm">Cookie necessari <span className="text-xs text-gray-500">(sempre attivi)</span></span>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={() => handlePreferenceChange('analytics')}
                    className="mr-2"
                  />
                  <span className="text-sm">Cookie analitici</span>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.marketing}
                    onChange={() => handlePreferenceChange('marketing')}
                    className="mr-2"
                  />
                  <span className="text-sm">Cookie di marketing</span>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.preferences}
                    onChange={() => handlePreferenceChange('preferences')}
                    className="mr-2"
                  />
                  <span className="text-sm">Cookie di preferenza</span>
                </label>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-between p-4 border-t">
          <div className="flex gap-2">
            {!showDetails ? (
              <button
                onClick={showCustomizeOptions}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Personalizza
              </button>
            ) : (
              <button
                onClick={savePreferences}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Salva preferenze
              </button>
            )}
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