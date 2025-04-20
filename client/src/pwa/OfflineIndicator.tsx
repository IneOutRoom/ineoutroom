import React, { useState, useEffect } from 'react';
import { AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Mostra un messaggio brevemente quando si torna online
      setShowOfflineMessage(true);
      setTimeout(() => setShowOfflineMessage(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showOfflineMessage) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <Alert variant={isOnline ? "default" : "destructive"}>
        <div className="flex items-center">
          {isOnline ? (
            <Wifi className="h-4 w-4 mr-2" />
          ) : (
            <WifiOff className="h-4 w-4 mr-2" />
          )}
          <AlertTitle>
            {isOnline ? 'Connessione ripristinata' : 'Sei offline'}
          </AlertTitle>
        </div>
        <AlertDescription>
          {isOnline 
            ? 'Sei tornato online. Ora puoi utilizzare tutte le funzionalità dell\'app.'
            : 'La connessione a Internet è stata persa. Alcune funzionalità potrebbero non essere disponibili.'}
        </AlertDescription>
      </Alert>
    </div>
  );
}