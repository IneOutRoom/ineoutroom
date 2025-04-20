// SentryQuickTest.jsx - Componente leggero per test Sentry
import { useState } from 'react';
import * as Sentry from '@sentry/nextjs';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { BugPlay, AlertTriangle, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function SentryQuickTest() {
  const [testResult, setTestResult] = useState(null);
  const { toast } = useToast();

  // Test myUndefinedFunction error
  const handleTestError = () => {
    try {
      // Genera un errore chiamando una funzione non definita
      // eslint-disable-next-line no-undef
      myUndefinedFunction();
    } catch (error) {
      // Cattura l'errore e lo invia a Sentry
      Sentry.captureException(error);
      
      // Mostra un toast di conferma
      toast({
        title: "Test Sentry completato",
        description: "Errore myUndefinedFunction catturato e inviato a Sentry",
      });
      
      // Aggiorna lo stato con il risultato
      setTestResult({
        success: true,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  };

  return (
    <Card className="border-2 border-orange-200 bg-orange-50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <BugPlay className="h-5 w-5 text-orange-500" />
          Test Sentry Error Monitoring
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pb-2">
        <p className="text-sm text-gray-600 mb-4">
          Verifica il funzionamento del monitoraggio errori con test "myUndefinedFunction"
        </p>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleTestError}
          className="w-full border-orange-300 hover:bg-orange-100 hover:text-orange-700"
        >
          <AlertTriangle className="mr-2 h-4 w-4 text-orange-600" />
          Genera errore di test
        </Button>
      </CardContent>
      
      {testResult && (
        <CardFooter className="pt-0">
          <div className="w-full flex items-center gap-2 text-xs p-2 bg-orange-100 rounded">
            <Activity className="h-3.5 w-3.5 text-orange-600 shrink-0" />
            <div className="flex-1">
              <span className="font-medium">Errore:</span> {testResult.error}
              <Badge size="sm" variant="outline" className="ml-2 text-[10px] border-orange-300">
                {new Date(testResult.timestamp).toLocaleTimeString()}
              </Badge>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}