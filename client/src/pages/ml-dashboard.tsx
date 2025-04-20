import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle, Brain, Server } from 'lucide-react';
import { useLocation } from 'wouter';

// Import dei componenti ML
import DynamicPricingWidget from '@/components/ml/DynamicPricingWidget';
import ChurnRisk from '@/components/ml/ChurnRisk';
import UserClusters from '@/components/ml/UserClusters';

/**
 * Dashboard per testare i modelli di machine learning
 */
export default function MLDashboard() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [_, navigate] = useLocation();

  // Stato per l'utente/proprietà selezionati
  const [selectedUserId, setSelectedUserId] = useState<number>(1);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number>(1);
  const [price, setPrice] = useState<number>(850);
  
  // Stato per il servizio ML
  const [mlServiceStatus, setMlServiceStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  
  // Controlla lo stato del servizio ML
  const checkMlService = async () => {
    setMlServiceStatus('checking');
    try {
      const response = await fetch('http://localhost:5001/health');
      if (response.ok) {
        setMlServiceStatus('online');
      } else {
        setMlServiceStatus('offline');
      }
    } catch (error) {
      setMlServiceStatus('offline');
    }
  };
  
  // Controlla lo stato all'avvio
  useState(() => {
    checkMlService();
  });
  
  // Gestisci l'avvio del servizio ML
  const startMlService = () => {
    toast({
      title: "Avvio servizio ML",
      description: "Per avviare il servizio ML, esegui 'python ml/start_ml_service.py' in un terminale separato.",
    });
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Se l'utente non è autenticato, reindirizza alla pagina di login
  if (!user) {
    navigate("/auth");
    return null;
  }
  
  // Per questa implementazione, consideriamo solo l'utente con ID=1 come amministratore
  // In una versione più avanzata, avremmo un campo isAdmin nello schema utente
  if (user.id !== 1) {
    return (
      <div className="container mx-auto py-10 px-4 max-w-3xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Accesso negato</AlertTitle>
          <AlertDescription>
            Non hai i permessi necessari per accedere alla dashboard di Machine Learning.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col space-y-2 mb-8">
        <h1 className="text-3xl font-bold">Dashboard Machine Learning</h1>
        <p className="text-muted-foreground">
          Testa e monitora i modelli di machine learning del sistema
        </p>
      </div>
      
      {/* Stato del servizio ML */}
      <Card className="mb-8">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center">
                <Server className="h-5 w-5 mr-2" />
                Stato del Servizio ML
              </CardTitle>
              <CardDescription>
                Verifica lo stato del microservizio di machine learning
              </CardDescription>
            </div>
            <div>
              <Button
                variant={mlServiceStatus === 'online' ? 'outline' : 'default'}
                size="sm"
                onClick={mlServiceStatus === 'online' ? checkMlService : startMlService}
              >
                {mlServiceStatus === 'checking' ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Controllo...
                  </>
                ) : mlServiceStatus === 'online' ? (
                  'Ricontrolla'
                ) : (
                  'Avvia servizio'
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div
              className={`h-3 w-3 rounded-full ${
                mlServiceStatus === 'online'
                  ? 'bg-green-500'
                  : mlServiceStatus === 'checking'
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
            />
            <span>
              {mlServiceStatus === 'online'
                ? 'Servizio ML online'
                : mlServiceStatus === 'checking'
                ? 'Controllo stato...'
                : 'Servizio ML offline'}
            </span>
          </div>
          
          {mlServiceStatus === 'offline' && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Servizio non disponibile</AlertTitle>
              <AlertDescription>
                Il servizio di machine learning non è attivo. Per avviarlo, esegui il comando:
                <code className="block bg-muted p-2 my-2 rounded text-sm">
                  python ml/start_ml_service.py
                </code>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      
      {/* Selettori di utente e proprietà */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Seleziona Utente</CardTitle>
            <CardDescription>
              Scegli un utente per testare le feature di ML
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Select 
                value={selectedUserId.toString()} 
                onValueChange={(value) => setSelectedUserId(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona utente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Utente Admin (ID: 1)</SelectItem>
                  <SelectItem value="2">Mario Rossi (ID: 2)</SelectItem>
                  <SelectItem value="3">Giulia Bianchi (ID: 3)</SelectItem>
                  <SelectItem value="4">Paolo Verdi (ID: 4)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Seleziona Proprietà</CardTitle>
            <CardDescription>
              Scegli una proprietà per testare le feature di ML
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Select 
                value={selectedPropertyId.toString()} 
                onValueChange={(value) => setSelectedPropertyId(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona proprietà" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Bilocale Milano (ID: 1)</SelectItem>
                  <SelectItem value="2">Trilocale Roma (ID: 2)</SelectItem>
                  <SelectItem value="3">Monolocale Firenze (ID: 3)</SelectItem>
                  <SelectItem value="4">Villa Napoli (ID: 4)</SelectItem>
                </SelectContent>
              </Select>
              
              <Input
                type="number"
                min={100}
                max={5000}
                value={price}
                onChange={(e) => setPrice(parseInt(e.target.value))}
                className="max-w-[120px]"
              />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Demo dei modelli ML */}
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <Brain className="h-5 w-5 mr-2" /> Demo Modelli ML
      </h2>
      
      <Tabs defaultValue="dynamic-pricing" className="w-full mb-8">
        <TabsList className="w-full">
          <TabsTrigger value="dynamic-pricing" className="flex-1">
            Dynamic Pricing
          </TabsTrigger>
          <TabsTrigger value="churn" className="flex-1">
            Predictive Churn
          </TabsTrigger>
          <TabsTrigger value="clustering" className="flex-1">
            User Clustering
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="dynamic-pricing" className="mt-4 space-y-4">
          <p className="text-muted-foreground">
            Il modello di dynamic pricing analizza la proprietà e suggerisce variazioni di prezzo ottimali in base a fattori come posizione, caratteristiche della proprietà, domanda di mercato e stagionalità.
          </p>
          
          <div className="max-w-md mx-auto">
            <DynamicPricingWidget 
              propertyId={selectedPropertyId} 
              currentPrice={price}
              onPriceChange={(newPrice) => setPrice(newPrice)}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="churn" className="mt-4 space-y-4">
          <p className="text-muted-foreground">
            Il modello di predictive churn analizza il comportamento dell'utente per prevedere il rischio di abbandono e identificare i fattori chiave che contribuiscono a questo rischio.
          </p>
          
          <div className="max-w-md mx-auto">
            <ChurnRisk userId={selectedUserId} />
          </div>
        </TabsContent>
        
        <TabsContent value="clustering" className="mt-4 space-y-4">
          <p className="text-muted-foreground">
            Il modello di clustering analizza il comportamento degli utenti e li raggruppa in segmenti significativi per personalizzare l'esperienza e le strategie di marketing.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <UserClusters userId={selectedUserId} />
            <UserClusters showAllClusters={true} />
          </div>
        </TabsContent>
      </Tabs>
      
      <Separator className="my-8" />
      
      <div className="text-sm text-muted-foreground">
        <p>
          Nota: Questi modelli sono addestrati su dati simulati a scopo dimostrativo. In un ambiente di produzione, utilizzerebbero dati reali e modelli più sofisticati.
        </p>
      </div>
    </div>
  );
}