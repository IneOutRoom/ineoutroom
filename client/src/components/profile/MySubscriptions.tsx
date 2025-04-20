import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Calendar, CreditCard, Package, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { Link, useLocation } from 'wouter';

interface SubscriptionPlanDetails {
  title: string;
  description: string;
  price: string;
  features: string[];
  buttonText: string;
  planId: string;
}

export default function MySubscriptions() {
  const { user } = useAuth();
  const [_, navigate] = useLocation();

  // Dettagli dei piani disponibili
  const subscriptionPlans: Record<string, SubscriptionPlanDetails> = {
    standard: {
      title: 'Piano Standard',
      description: 'Ideale per chi ha più proprietà da pubblicare',
      price: '€5,99/mese',
      features: [
        'Fino a 30 annunci attivi contemporaneamente',
        'Statistiche base sulle visualizzazioni',
        'Supporto via email',
        'Annunci in evidenza nella ricerca'
      ],
      buttonText: 'Gestisci piano',
      planId: 'standard'
    },
    premium: {
      title: 'Piano Premium',
      description: 'Per professionisti e agenzie immobiliari',
      price: '€9,99/mese',
      features: [
        'Annunci illimitati',
        'Statistiche avanzate e reportistica',
        'Supporto prioritario',
        'Evidenziazione annunci premium',
        'Strumenti di analisi di mercato'
      ],
      buttonText: 'Gestisci piano',
      planId: 'premium'
    },
    '5listings': {
      title: 'Pacchetto 5 inserzioni',
      description: 'Una tantum - senza abbonamento',
      price: '€0,99',
      features: [
        '5 inserzioni da utilizzare',
        'Nessun abbonamento mensile',
        'Validità illimitata',
        'Supporto base'
      ],
      buttonText: 'Acquista di nuovo',
      planId: '5listings'
    }
  };

  // Calcola il tempo rimanente dell'abbonamento in percentuale
  const calculateRemainingTime = (): number => {
    if (!user?.subscriptionExpiresAt) return 0;
    
    const now = new Date();
    const expiryDate = new Date(user.subscriptionExpiresAt);
    const subscriptionStartDate = new Date(user.subscriptionStartDate || now);
    
    // Se la data di scadenza è nel passato, l'abbonamento è scaduto
    if (expiryDate < now) return 0;
    
    // Calcola la durata totale dell'abbonamento in millisecondi
    const totalDuration = expiryDate.getTime() - subscriptionStartDate.getTime();
    // Calcola il tempo trascorso
    const elapsedTime = now.getTime() - subscriptionStartDate.getTime();
    // Calcola il tempo rimanente come percentuale
    const remainingTimePercentage = 100 - (elapsedTime / totalDuration * 100);
    
    return remainingTimePercentage;
  };

  // Verifica se l'abbonamento è attivo
  const hasActiveSubscription = user?.subscriptionPlan && user?.subscriptionExpiresAt && new Date(user.subscriptionExpiresAt) > new Date();

  // Verifica se ha pacchetti di inserzioni
  const hasListingPackage = user?.remainingListings && user.remainingListings > 0;

  // Se non ha né abbonamento né pacchetti
  if (!hasActiveSubscription && !hasListingPackage && user?.usedFreeListing === true) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Nessun abbonamento attivo</CardTitle>
            <CardDescription>
              Non hai abbonamenti attivi né pacchetti di inserzioni disponibili
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Sottoscrivi un abbonamento o acquista un pacchetto di inserzioni per pubblicare i tuoi annunci
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate('/subscription-plans')}>
              Scopri i piani disponibili
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {hasActiveSubscription && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>{subscriptionPlans[user?.subscriptionPlan || '']?.title || 'Piano attivo'}</CardTitle>
                <CardDescription>
                  {user?.subscriptionPlan === 'standard' ? 'Fino a 30 annunci attivi' : 'Annunci illimitati'}
                </CardDescription>
              </div>
              <Badge variant="outline" className="border-primary text-primary">
                Abbonamento attivo
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Scadenza abbonamento</span>
                <span className="text-sm font-medium">
                  {user?.subscriptionExpiresAt ? formatDate(user.subscriptionExpiresAt) : 'N/D'}
                </span>
              </div>
              <Progress value={calculateRemainingTime()} className="h-2" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="flex items-start gap-3">
                <CreditCard className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Metodo di pagamento</p>
                  <p className="text-sm text-muted-foreground">Carte di credito/debito</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Prossimo rinnovo</p>
                  <p className="text-sm text-muted-foreground">
                    {user?.subscriptionExpiresAt ? formatDate(user.subscriptionExpiresAt) : 'N/D'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-3">
            <Button>Gestisci abbonamento</Button>
            <Button variant="outline">Cambia piano</Button>
          </CardFooter>
        </Card>
      )}
      
      {hasListingPackage && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Pacchetto inserzioni</CardTitle>
                <CardDescription>
                  Inserzioni disponibili per i tuoi annunci
                </CardDescription>
              </div>
              <Badge className="bg-amber-500 hover:bg-amber-600">
                {user?.remainingListings} inserzioni rimaste
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Pacchetto 5 inserzioni</p>
                  <p className="text-sm text-muted-foreground">
                    Puoi pubblicare ancora {user?.remainingListings} annunci
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Star className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="font-medium">Validità</p>
                  <p className="text-sm text-muted-foreground">
                    Le inserzioni non hanno scadenza e possono essere utilizzate in qualsiasi momento
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate('/subscription-plans')}>
              Acquista un nuovo pacchetto
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {user?.usedFreeListing === false && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Prima inserzione gratuita</CardTitle>
                <CardDescription>
                  Pubblica il tuo primo annuncio gratuitamente
                </CardDescription>
              </div>
              <Badge className="bg-green-500 hover:bg-green-600">
                Disponibile
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Hai ancora a disposizione la tua prima inserzione gratuita. Pubblica un annuncio per utilizzarla!
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate('/properties/new')}>
              Pubblica il tuo primo annuncio
            </Button>
          </CardFooter>
        </Card>
      )}
      
      <div className="text-center mt-8">
        <h3 className="text-lg font-medium mb-2">Cerchi più funzionalità?</h3>
        <p className="text-muted-foreground mb-4">
          Scopri i nostri piani di abbonamento per accedere a più inserzioni e funzionalità avanzate
        </p>
        <Button onClick={() => navigate('/subscription-plans')}>
          Visualizza tutti i piani
        </Button>
      </div>
    </div>
  );
}