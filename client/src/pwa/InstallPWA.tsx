import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function InstallPWA() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    
    installPrompt.prompt();
    
    const { outcome } = await installPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setInstallPrompt(null);
      setShowInstallBanner(false);
    }
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
  };

  if (!showInstallBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-sm">
      <Card className="border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Installa In&Out</CardTitle>
          <CardDescription>
            Installa l'app sul tuo dispositivo per un accesso più veloce
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <ul className="text-sm list-disc pl-5 space-y-1">
            <li>Accesso rapido dalla schermata Home</li>
            <li>Uso offline per alcune funzionalità</li>
            <li>Esperienza più fluida e veloce</li>
          </ul>
        </CardContent>
        <CardFooter className="flex justify-between pt-2">
          <Button variant="ghost" size="sm" onClick={handleDismiss}>
            Non ora
          </Button>
          <Button size="sm" onClick={handleInstallClick}>
            <Download className="h-4 w-4 mr-2" />
            Installa
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}