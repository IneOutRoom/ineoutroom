import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckIcon, XIcon } from 'lucide-react';
import { Link } from 'wouter';

interface Plan {
  id: string;
  title: string;
  price: number;
  period: string;
  isPopular?: boolean;
  features: {
    text: string;
    included: boolean;
  }[];
}

export function SubscriptionPlans() {
  const plans: Plan[] = [
    {
      id: 'single',
      title: 'Pacchetto 5 inserzioni',
      price: 0.99,
      period: 'Una tantum',
      features: [
        { text: '5 inserzioni utilizzabili quando vuoi', included: true },
        { text: 'Validità illimitata', included: true },
        { text: 'Fino a 8 foto per annuncio', included: true },
        { text: 'Nessuna posizione in evidenza', included: false },
      ],
    },
    {
      id: 'standard',
      title: 'Standard',
      price: 5.99,
      period: 'Al mese',
      isPopular: true,
      features: [
        { text: '30 annunci pubblicati', included: true },
        { text: 'Visibili per 60 giorni', included: true },
        { text: 'Fino a 15 foto per annuncio', included: true },
        { text: '5 posizioni in evidenza', included: true },
      ],
    },
    {
      id: 'premium',
      title: 'Premium',
      price: 9.99,
      period: 'Al mese',
      features: [
        { text: 'Annunci illimitati', included: true },
        { text: 'Visibili per 90 giorni', included: true },
        { text: 'Fino a 30 foto per annuncio', included: true },
        { text: '20 posizioni in evidenza', included: true },
      ],
    },
  ];

  return (
    <section className="py-16 bg-neutral-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="font-montserrat font-bold text-2xl md:text-3xl">Pubblica il tuo annuncio e trova inquilini</h2>
          <p className="text-neutral-600 mt-4">Scegli il piano migliore per le tue esigenze e metti subito in evidenza il tuo immobile o la tua stanza.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.id}
              className={`relative overflow-hidden border transition-transform hover:scale-105 ${
                plan.isPopular ? 'border-2 border-primary shadow-lg' : 'border-neutral-200 shadow-md'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-4 py-1 rounded-bl-lg">
                  POPOLARE
                </div>
              )}
              
              <CardContent className="p-6">
                <h3 className="font-montserrat font-semibold text-xl">{plan.title}</h3>
                <div className="mt-4 text-3xl font-bold text-primary">€{plan.price.toFixed(2)}</div>
                <p className="text-neutral-500 text-sm">{plan.period}</p>
                
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      {feature.included ? (
                        <CheckIcon className="text-green-500 mt-1 mr-2 h-4 w-4 flex-shrink-0" />
                      ) : (
                        <XIcon className="text-neutral-400 mt-1 mr-2 h-4 w-4 flex-shrink-0" />
                      )}
                      <span className={`text-sm ${feature.included ? '' : 'text-neutral-400'}`}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
                
                <Link href={`/checkout?plan=${plan.id}`}>
                  <Button 
                    className={`mt-8 w-full ${
                      plan.isPopular 
                        ? 'bg-primary hover:bg-primary/90 text-white' 
                        : 'bg-white border border-primary text-primary hover:bg-primary hover:text-white'
                    }`}
                  >
                    Scegli piano
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <p className="text-sm text-neutral-500">Tutti i piani includono la chat con gli inquilini interessati e supporto via email</p>
        </div>
      </div>
    </section>
  );
}
