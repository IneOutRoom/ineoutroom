import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { CookieManager } from '@/lib/cookieManager';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [cookiePreferences, setCookiePreferences] = useState<CookiePreferences>({
    necessary: true, // I cookie necessari sono sempre abilitati
    analytics: false,
    marketing: false,
    preferences: false,
  });

  // Controlla se il consenso cookie è già stato fornito
  useEffect(() => {
    if (!CookieManager.hasConsent()) {
      setIsVisible(true);
    } else {
      setCookiePreferences(CookieManager.getPreferences());
    }
  }, []);

  // Salva le preferenze nel localStorage e imposta i cookie di conseguenza
  const savePreferences = () => {
    CookieManager.savePreferences(cookiePreferences);
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
    CookieManager.savePreferences(allAccepted);
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
    CookieManager.savePreferences(allRejected);
    setIsVisible(false);
  };

  // Aggiorna una specifica preferenza cookie
  const handlePreferenceChange = (key: keyof CookiePreferences) => {
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
      <Card className="max-w-4xl mx-auto border border-neutral-200 shadow-lg">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-xl font-bold">Preferenze Cookie</CardTitle>
            <CardDescription>
              Utilizziamo i cookie per migliorare la tua esperienza sul nostro sito
            </CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={rejectAll}
            className="h-8 w-8 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {showPreferences ? (
            <div className="space-y-4 pt-2">
              <div className="flex items-start space-x-3 space-y-0">
                <Checkbox 
                  id="necessary" 
                  checked={cookiePreferences.necessary} 
                  disabled
                />
                <div className="space-y-1 leading-none">
                  <Label 
                    htmlFor="necessary" 
                    className="font-medium text-sm cursor-pointer"
                  >
                    Cookie necessari
                  </Label>
                  <p className="text-sm text-neutral-500">
                    Questi cookie sono essenziali per il funzionamento del sito e non possono essere disattivati.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 space-y-0">
                <Checkbox 
                  id="analytics" 
                  checked={cookiePreferences.analytics} 
                  onCheckedChange={() => handlePreferenceChange('analytics')}
                />
                <div className="space-y-1 leading-none">
                  <Label 
                    htmlFor="analytics" 
                    className="font-medium text-sm cursor-pointer"
                  >
                    Cookie analitici
                  </Label>
                  <p className="text-sm text-neutral-500">
                    Ci aiutano a capire come utilizzi il sito, per migliorare l'esperienza degli utenti.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 space-y-0">
                <Checkbox 
                  id="marketing" 
                  checked={cookiePreferences.marketing} 
                  onCheckedChange={() => handlePreferenceChange('marketing')}
                />
                <div className="space-y-1 leading-none">
                  <Label 
                    htmlFor="marketing" 
                    className="font-medium text-sm cursor-pointer"
                  >
                    Cookie di marketing
                  </Label>
                  <p className="text-sm text-neutral-500">
                    Vengono utilizzati per mostrarti annunci più pertinenti in base ai tuoi interessi.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 space-y-0">
                <Checkbox 
                  id="preferences" 
                  checked={cookiePreferences.preferences} 
                  onCheckedChange={() => handlePreferenceChange('preferences')}
                />
                <div className="space-y-1 leading-none">
                  <Label 
                    htmlFor="preferences" 
                    className="font-medium text-sm cursor-pointer"
                  >
                    Cookie di preferenze
                  </Label>
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
              <a href="/privacy" className="text-primary hover:underline ml-1">Informativa sulla Privacy</a>.
            </p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col md:flex-row gap-2 justify-between">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowPreferences(!showPreferences)}
              className="text-xs md:text-sm"
            >
              {showPreferences ? 'Nascondi preferenze' : 'Personalizza'}
            </Button>
            <Button 
              variant="outline" 
              onClick={rejectAll}
              className="text-xs md:text-sm"
            >
              Rifiuta tutti
            </Button>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            {showPreferences ? (
              <Button 
                onClick={savePreferences}
                className="w-full md:w-auto text-xs md:text-sm"
              >
                Salva preferenze
              </Button>
            ) : (
              <Button 
                onClick={acceptAll}
                className="w-full md:w-auto text-xs md:text-sm"
              >
                Accetta tutti
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}