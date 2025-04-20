import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const router = useRouter();
  
  // Configurazione dei cookie predefinita
  const [cookiePreferences, setCookiePreferences] = useState({
    necessary: true, // Sempre abilitati
    analytics: false,
    marketing: false,
    preferences: false,
  });

  // Verifica se l'utente ha già acconsentito ai cookie
  useEffect(() => {
    // Controlla se il componente è montato sul client (non durante SSR)
    if (typeof window !== 'undefined') {
      const hasConsent = localStorage.getItem('cookie-consent');
      if (!hasConsent) {
        setIsVisible(true);
      }
    }
  }, []);

  // Salva le preferenze dell'utente
  const savePreferences = () => {
    localStorage.setItem('cookie-consent', 'true');
    localStorage.setItem('cookie-preferences', JSON.stringify(cookiePreferences));
    
    // Qui puoi implementare la logica per impostare/rimuovere i cookie in base alle preferenze
    setIsVisible(false);
  };

  // Accetta tutti i cookie
  const acceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };
    setCookiePreferences(allAccepted);
    localStorage.setItem('cookie-consent', 'true');
    localStorage.setItem('cookie-preferences', JSON.stringify(allAccepted));
    
    // Qui puoi implementare la logica per impostare tutti i cookie
    setIsVisible(false);
  };

  // Rifiuta tutti i cookie eccetto quelli necessari
  const rejectAll = () => {
    const allRejected = {
      necessary: true, // I cookie necessari sono sempre abilitati
      analytics: false,
      marketing: false,
      preferences: false,
    };
    setCookiePreferences(allRejected);
    localStorage.setItem('cookie-consent', 'true');
    localStorage.setItem('cookie-preferences', JSON.stringify(allRejected));
    
    // Qui puoi implementare la logica per rimuovere tutti i cookie non necessari
    setIsVisible(false);
  };

  // Aggiorna una specifica preferenza cookie
  const handlePreferenceChange = (key) => {
    // Non permettere di disabilitare i cookie necessari
    if (key === 'necessary') return;
    
    setCookiePreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 bg-black/5 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto border border-neutral-200 rounded-lg shadow-lg bg-white">
        <div className="flex flex-row items-start justify-between p-4 pb-2 space-y-0">
          <div>
            <h3 className="text-xl font-bold">Preferenze Cookie</h3>
            <p className="text-gray-500">
              Utilizziamo i cookie per migliorare la tua esperienza sul nostro sito
            </p>
          </div>
          <button 
            className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-gray-100"
            onClick={rejectAll}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className="p-4">
          {showPreferences ? (
            <div className="space-y-4 pt-2">
              <div className="flex items-start space-x-3 space-y-0">
                <input 
                  type="checkbox" 
                  id="necessary" 
                  checked={cookiePreferences.necessary} 
                  disabled
                  className="mt-1"
                />
                <div className="space-y-1 leading-none">
                  <label 
                    htmlFor="necessary" 
                    className="font-medium text-sm cursor-pointer"
                  >
                    Cookie necessari
                  </label>
                  <p className="text-sm text-neutral-500">
                    Questi cookie sono essenziali per il funzionamento del sito e non possono essere disattivati.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 space-y-0">
                <input 
                  type="checkbox" 
                  id="analytics" 
                  checked={cookiePreferences.analytics} 
                  onChange={() => handlePreferenceChange('analytics')}
                  className="mt-1"
                />
                <div className="space-y-1 leading-none">
                  <label 
                    htmlFor="analytics" 
                    className="font-medium text-sm cursor-pointer"
                  >
                    Cookie analitici
                  </label>
                  <p className="text-sm text-neutral-500">
                    Ci aiutano a capire come utilizzi il sito, per migliorare l'esperienza degli utenti.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 space-y-0">
                <input 
                  type="checkbox" 
                  id="marketing" 
                  checked={cookiePreferences.marketing} 
                  onChange={() => handlePreferenceChange('marketing')}
                  className="mt-1"
                />
                <div className="space-y-1 leading-none">
                  <label 
                    htmlFor="marketing" 
                    className="font-medium text-sm cursor-pointer"
                  >
                    Cookie di marketing
                  </label>
                  <p className="text-sm text-neutral-500">
                    Vengono utilizzati per mostrarti annunci più pertinenti in base ai tuoi interessi.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 space-y-0">
                <input 
                  type="checkbox" 
                  id="preferences" 
                  checked={cookiePreferences.preferences} 
                  onChange={() => handlePreferenceChange('preferences')}
                  className="mt-1"
                />
                <div className="space-y-1 leading-none">
                  <label 
                    htmlFor="preferences" 
                    className="font-medium text-sm cursor-pointer"
                  >
                    Cookie di preferenze
                  </label>
                  <p className="text-sm text-neutral-500">
                    Permettono al sito di ricordare le tue preferenze, come la lingua o la regione.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-neutral-600 pb-2">
              Questo sito utilizza i cookie per migliorare la tua esperienza, personalizzare contenuti e annunci,
              fornire funzionalità di social media e analizzare il nostro traffico. Puoi scegliere se accettare tutti i cookie,
              solo quelli necessari o personalizzare le tue preferenze. Per maggiori informazioni, consulta la nostra
              <Link href="/cookie-policy" className="text-primary hover:underline ml-1">
                Informativa sulla Privacy
              </Link>.
            </p>
          )}
        </div>
        <div className="p-4 flex flex-col md:flex-row gap-2 justify-between border-t">
          <div className="flex gap-2">
            <button 
              className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              onClick={() => setShowPreferences(!showPreferences)}
            >
              {showPreferences ? 'Nascondi preferenze' : 'Personalizza'}
            </button>
            <button 
              className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              onClick={rejectAll}
            >
              Rifiuta tutti
            </button>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            {showPreferences ? (
              <button 
                className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary/90 w-full md:w-auto"
                onClick={savePreferences}
              >
                Salva preferenze
              </button>
            ) : (
              <button 
                className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary/90 w-full md:w-auto"
                onClick={acceptAll}
              >
                Accetta tutti
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}