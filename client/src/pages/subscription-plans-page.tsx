import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Link, useLocation } from 'wouter';
import { Check, AlertCircle, Loader2, LogIn } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const SubscriptionPlansPage = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [billingCycle, setBillingCycle] = useState('monthly');

  // Ottieni dati sull'account corrente dell'utente (solo se autenticato)
  const { data: userRights, isLoading: isRightsLoading } = useQuery({
    queryKey: ['/api/user/publishing-rights'],
    enabled: !!user,
  });

  // Gestisci il checkout o il login se necessario
  const handleCheckout = async (plan: string) => {
    // Se l'utente non è loggato, reindirizza alla pagina di login
    if (!user) {
      toast({
        title: "Accesso richiesto",
        description: "Devi accedere o registrarti per acquistare un piano",
        variant: "default",
      });
      setLocation(`/auth?redirect=/subscription-plans`);
      return;
    }
    
    try {
      setPaymentProcessing(true);
      
      // Reindirizza al checkout con il piano selezionato
      setLocation(`/checkout?plan=${plan}`);
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'elaborazione del pagamento. Riprova più tardi.",
        variant: "destructive",
      });
      setPaymentProcessing(false);
    }
  };

  // Pagina di caricamento (solo per utenti autenticati)
  if (user && (isAuthLoading || isRightsLoading)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Informazioni sull'abbonamento (solo per utenti autenticati)
  const hasActiveSubscription = user ? userRights?.hasActiveSubscription : false;
  const currentPlan = user ? userRights?.subscriptionPlan : null;
  const expiresAt = user && userRights?.expiresAt ? new Date(userRights.expiresAt) : null;
  const daysRemaining = expiresAt ? Math.ceil((expiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <div className="container max-w-5xl py-10 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center text-center mb-12">
        <h1 className="text-3xl font-extrabold tracking-tight lg:text-5xl mb-3">
          Pubblica i tuoi annunci
        </h1>
        <p className="max-w-2xl text-lg text-gray-600 dark:text-gray-400">
          Scegli il piano che più si adatta alle tue esigenze
        </p>
      </div>

      {/* Banner per utenti non autenticati */}
      {!user && (
        <Alert className="mb-8 border-blue-500 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
          <LogIn className="h-4 w-4 text-blue-600 dark:text-blue-500" />
          <AlertTitle>Accesso richiesto per l'acquisto</AlertTitle>
          <AlertDescription>
            Puoi visualizzare tutti i nostri piani, ma per procedere all'acquisto è necessario 
            <Button 
              variant="link" 
              className="px-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              onClick={() => setLocation('/auth?redirect=/subscription-plans')}
            >
              accedere o registrarti
            </Button>
            al tuo account In&Out.
          </AlertDescription>
        </Alert>
      )}

      {/* Avviso abbonamento attivo */}
      {hasActiveSubscription && (
        <Alert className="mb-8 border-green-500 bg-green-50 dark:bg-green-950 dark:border-green-800">
          <AlertCircle className="h-4 w-4 text-green-600 dark:text-green-500" />
          <AlertTitle>Abbonamento attivo</AlertTitle>
          <AlertDescription>
            Hai già un abbonamento {currentPlan === 'premium' ? 'Premium' : 'Standard'} attivo 
            che scadrà tra {daysRemaining} giorni.
            {currentPlan === 'standard' && " Puoi fare l'upgrade al piano Premium in qualsiasi momento."}
          </AlertDescription>
        </Alert>
      )}

      {/* Piano 5 inserzioni (sempre visibile) */}
      <Card className="mb-10 overflow-hidden border-2 border-amber-300 dark:border-amber-700 bg-gradient-to-br from-amber-50 to-white dark:from-zinc-900 dark:to-zinc-950">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold flex items-center">
            <span className="bg-amber-200 text-amber-800 dark:bg-amber-900 dark:text-amber-200 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">POPOLARE</span>
            Pacchetto 5 inserzioni
          </CardTitle>
          <CardDescription>
            Pubblica fino a 5 annunci con un singolo pagamento
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="mb-4">
            <span className="text-4xl font-extrabold">€0,99</span>
            <span className="text-gray-600 dark:text-gray-400 ml-1">una tantum</span>
          </div>
          <ul className="space-y-2 mb-6">
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
              <span>5 inserzioni utilizzabili quando vuoi</span>
            </li>
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
              <span>Chat illimitate con gli interessati</span>
            </li>
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
              <span>Visibilità standard nei risultati di ricerca</span>
            </li>
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
              <span>Nessun abbonamento, nessun rinnovo automatico</span>
            </li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full bg-amber-500 hover:bg-amber-600 text-white" 
            onClick={() => handleCheckout('5listings')}
            disabled={paymentProcessing}
          >
            {paymentProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Acquista ora
          </Button>
        </CardFooter>
      </Card>

      {/* Abbonamenti mensili e annuali */}
      <Tabs defaultValue="monthly" className="w-full" onValueChange={setBillingCycle}>
        <div className="flex justify-center mb-8">
          <TabsList className="grid w-full max-w-xs grid-cols-2">
            <TabsTrigger value="monthly">Mensile</TabsTrigger>
            <TabsTrigger value="yearly">Annuale</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="monthly" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Piano Standard */}
            <Card className={`${currentPlan === 'standard' ? 'border-2 border-primary' : ''}`}>
              <CardHeader>
                <CardTitle>Standard</CardTitle>
                <CardDescription>
                  Ideale per chi ha pochi immobili da affittare
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="mb-4">
                  <span className="text-4xl font-extrabold">€5,99</span>
                  <span className="text-gray-600 dark:text-gray-400 ml-1">/mese</span>
                </div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>Fino a 30 inserzioni al mese</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>Statistiche di visualizzazione</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>Suggerimento prezzi di mercato</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={() => handleCheckout('standard')}
                  disabled={paymentProcessing || currentPlan === 'standard'}
                >
                  {currentPlan === 'standard' ? 'Piano attivo' : 'Abbonati ora'}
                </Button>
              </CardFooter>
            </Card>

            {/* Piano Premium */}
            <Card className={`border-2 ${currentPlan === 'premium' ? 'border-primary' : 'border-transparent'}`}>
              <CardHeader className="bg-gradient-to-r from-purple-900 to-purple-700 text-white">
                <CardTitle>Premium</CardTitle>
                <CardDescription className="text-purple-100">
                  Per agenzie e proprietari con molti immobili
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="mb-4">
                  <span className="text-4xl font-extrabold">€9,99</span>
                  <span className="text-gray-600 dark:text-gray-400 ml-1">/mese</span>
                </div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>Inserzioni illimitate</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>Annunci in evidenza</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>Analisi avanzate con AI</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>Supporto prioritario</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-purple-700 hover:bg-purple-800 text-white" 
                  onClick={() => handleCheckout('premium')}
                  disabled={paymentProcessing || currentPlan === 'premium'}
                >
                  {currentPlan === 'premium' ? 'Piano attivo' : 'Abbonati ora'}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="yearly" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Piano Standard Annuale */}
            <Card>
              <CardHeader>
                <CardTitle>Standard Annuale</CardTitle>
                <CardDescription>
                  Risparmia 2 mesi con il piano annuale
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="mb-4">
                  <span className="text-4xl font-extrabold">€59,88</span>
                  <span className="text-gray-600 dark:text-gray-400 ml-1">/anno</span>
                  <div className="text-sm text-green-600 font-medium">
                    Risparmi €12 rispetto al mensile
                  </div>
                </div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>Tutti i vantaggi del piano Standard</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>Prezzo bloccato per 12 mesi</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={() => handleCheckout('standard-yearly')}
                  disabled={paymentProcessing}
                >
                  Abbonati ora
                </Button>
              </CardFooter>
            </Card>

            {/* Piano Premium Annuale */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-purple-900 to-purple-700 text-white">
                <CardTitle>Premium Annuale</CardTitle>
                <CardDescription className="text-purple-100">
                  Massimo risparmio per un anno intero
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="mb-4">
                  <span className="text-4xl font-extrabold">€99,90</span>
                  <span className="text-gray-600 dark:text-gray-400 ml-1">/anno</span>
                  <div className="text-sm text-green-600 font-medium">
                    Risparmi €19,98 rispetto al mensile
                  </div>
                </div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>Tutti i vantaggi del piano Premium</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>Prezzo bloccato per 12 mesi</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>Accesso anticipato alle nuove funzionalità</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-purple-700 hover:bg-purple-800 text-white" 
                  onClick={() => handleCheckout('premium-yearly')}
                  disabled={paymentProcessing}
                >
                  Abbonati ora
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-16 text-center space-y-4">
        <h3 className="text-xl font-bold">Hai ancora domande?</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Consulta le nostre <Link href="/faq" className="text-primary hover:underline">FAQ</Link> oppure
          contatta il nostro <Link href="/support" className="text-primary hover:underline">supporto clienti</Link>.
        </p>
      </div>
    </div>
  );
};

export default SubscriptionPlansPage;