import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/use-auth';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, Check, CreditCard } from 'lucide-react';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = typeof window !== 'undefined' ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY) : null;

// Componente per il form di pagamento
function CheckoutForm({ selectedPlan, amount }) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/', // Redirezione al completamento
        },
      });

      if (error) {
        toast({
          title: "Pagamento fallito",
          description: error.message || "Si è verificato un errore durante il pagamento",
          variant: "destructive",
        });
        setIsProcessing(false);
      } else {
        // Il pagamento è andato a buon fine e l'utente sarà reindirizzato
        // alla return_url grazie a stripe.confirmPayment()
        toast({
          title: "Pagamento completato",
          description: "Grazie per il tuo acquisto!",
        });
      }
    } catch (err) {
      console.error('Errore durante il pagamento:', err);
      toast({
        title: "Errore",
        description: "Si è verificato un errore imprevisto. Riprova più tardi.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="rounded-md border p-4 bg-neutral-50">
          <h3 className="font-medium text-neutral-900 mb-2">Dettagli del piano</h3>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium">{getPlanName(selectedPlan)}</p>
              <p className="text-xs text-neutral-500">{getPlanDescription(selectedPlan)}</p>
            </div>
            <div className="text-lg font-bold text-primary">€{(amount / 100).toFixed(2)}</div>
          </div>
        </div>
        
        <div>
          <h3 className="font-medium text-neutral-900 mb-2">Metodo di pagamento</h3>
          <PaymentElement options={{
            layout: { type: 'tabs', defaultCollapsed: false }
          }} />
        </div>
      </div>
      
      <Button
        type="submit"
        className="w-full bg-primary hover:bg-primary/90"
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Elaborazione...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Paga €{(amount / 100).toFixed(2)}
          </>
        )}
      </Button>
      
      <p className="text-xs text-neutral-500 text-center">
        Procedendo con il pagamento accetti i nostri <a href="/terms" className="text-primary hover:underline">Termini e Condizioni di Utilizzo</a>.
      </p>
    </form>
  );
}

// Funzioni di utilità per ottenere dettagli del piano
function getPlanName(plan) {
  switch (plan) {
    case '5listings':
      return 'Pacchetto 5 Inserzioni';
    case 'single':
      return 'Singolo Annuncio';
    case 'standard':
      return 'Piano Standard';
    case 'premium':
      return 'Piano Premium';
    case 'standard-yearly':
      return 'Piano Standard Annuale';
    case 'premium-yearly':
      return 'Piano Premium Annuale';
    default:
      return 'Piano personalizzato';
  }
}

function getPlanDescription(plan) {
  switch (plan) {
    case '5listings':
      return '5 inserzioni pubblicate, utilizzabili quando vuoi';
    case 'single':
      return '1 annuncio pubblicato, visibile per 30 giorni';
    case 'standard':
      return '30 annunci pubblicati, visibili per 60 giorni';
    case 'premium':
      return 'Annunci illimitati, visibili per 90 giorni';
    case 'standard-yearly':
      return 'Piano Standard per 1 anno intero - Risparmio di 2 mesi';
    case 'premium-yearly':
      return 'Piano Premium per 1 anno intero - Risparmio di 2 mesi';
    default:
      return 'Piano personalizzato';
  }
}

function getPlanAmount(plan) {
  switch (plan) {
    case '5listings':
      return 99; // €0.99 in centesimi
    case 'single':
      return 99; // €0.99 in centesimi
    case 'standard':
      return 599; // €5.99 in centesimi
    case 'premium':
      return 999; // €9.99 in centesimi
    case 'standard-yearly':
      return 5988; // €59.88 in centesimi
    case 'premium-yearly':
      return 9990; // €99.90 in centesimi
    default:
      return 99;
  }
}

// Componente principale per la pagina di checkout
export default function Checkout() {
  const [clientSecret, setClientSecret] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("single");
  const [amount, setAmount] = useState(99); // Default €0.99 in centesimi
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const planFromQuery = router.query.plan;

  useEffect(() => {
    // Imposta il piano dai parametri dell'URL se presente
    if (planFromQuery && ['5listings', 'single', 'standard', 'premium', 'standard-yearly', 'premium-yearly'].includes(planFromQuery)) {
      setSelectedPlan(planFromQuery);
      setAmount(getPlanAmount(planFromQuery));
    }
  }, [planFromQuery]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Crea l'intent di pagamento quando cambia il piano selezionato
    const createPaymentIntent = async () => {
      try {
        const response = await apiRequest("POST", "/api/create-payment-intent", {
          amount: amount,
          plan: selectedPlan
        });
        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (error) {
        console.error("Errore durante la creazione del pagamento:", error);
        toast({
          title: "Errore",
          description: "Non è stato possibile inizializzare il pagamento. Riprova più tardi.",
          variant: "destructive",
        });
      }
    };

    if (amount > 0) {
      createPaymentIntent();
    }
  }, [selectedPlan, amount, toast]);

  const handlePlanChange = (value) => {
    setSelectedPlan(value);
    setAmount(getPlanAmount(value));
  };

  if (typeof window === 'undefined' || !clientSecret) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center bg-neutral-50">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-neutral-700">Inizializzazione del pagamento...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Checkout - Scegli il tuo piano | In&Out</title>
        <meta name="description" content="Completa l'acquisto del tuo piano e inizia a pubblicare annunci su In&Out. Piani a partire da €0,99." />
        <meta property="og:title" content="Checkout - Scegli il tuo piano | In&Out" />
        <meta property="og:description" content="Completa l'acquisto del tuo piano e inizia a pubblicare annunci su In&Out. Piani a partire da €0,99." />
        <meta property="og:type" content="website" />
      </Head>
      
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-grow py-10 bg-neutral-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-3xl font-bold font-montserrat mb-6 text-center">Acquista il tuo piano</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {/* Plan selection cards */}
                <Card className={`cursor-pointer transition-all hover:border-primary ${selectedPlan === '5listings' ? 'border-2 border-primary' : ''}`}
                      onClick={() => handlePlanChange('5listings')}>
                  <CardHeader className="pb-2">
                    <div className="absolute top-0 right-0 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-bl-lg">
                      OFFERTA
                    </div>
                    <CardTitle className="text-lg">5 Inserzioni</CardTitle>
                    <div className="text-2xl font-bold text-primary">€0,99</div>
                    <CardDescription>Una tantum</CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <div className="flex items-start">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                      <span>5 annunci pubblicati</span>
                    </div>
                    <div className="flex items-start">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                      <span>Utilizzabili quando vuoi</span>
                    </div>
                    <div className="flex items-start">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                      <span>Visibili per 30 giorni</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    {selectedPlan === '5listings' && (
                      <div className="w-full text-center text-sm font-medium text-primary">Selezionato</div>
                    )}
                  </CardFooter>
                </Card>
                
                <Card className={`cursor-pointer transition-all hover:border-primary ${selectedPlan === 'single' ? 'border-2 border-primary' : ''}`}
                      onClick={() => handlePlanChange('single')}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Singolo Annuncio</CardTitle>
                    <div className="text-2xl font-bold text-primary">€0,99</div>
                    <CardDescription>Una tantum</CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <div className="flex items-start">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                      <span>1 annuncio pubblicato</span>
                    </div>
                    <div className="flex items-start">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                      <span>Visibile per 30 giorni</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    {selectedPlan === 'single' && (
                      <div className="w-full text-center text-sm font-medium text-primary">Selezionato</div>
                    )}
                  </CardFooter>
                </Card>
                
                <Card className={`cursor-pointer transition-all hover:border-primary ${selectedPlan === 'standard' ? 'border-2 border-primary' : ''}`}
                      onClick={() => handlePlanChange('standard')}>
                  <CardHeader className="pb-2">
                    <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-bl-lg">
                      POPOLARE
                    </div>
                    <CardTitle className="text-lg">Standard</CardTitle>
                    <div className="text-2xl font-bold text-primary">€5,99</div>
                    <CardDescription>Al mese</CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <div className="flex items-start">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                      <span>30 annunci pubblicati</span>
                    </div>
                    <div className="flex items-start">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                      <span>Visibili per 60 giorni</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    {selectedPlan === 'standard' && (
                      <div className="w-full text-center text-sm font-medium text-primary">Selezionato</div>
                    )}
                  </CardFooter>
                </Card>
                
                <Card className={`cursor-pointer transition-all hover:border-primary ${selectedPlan === 'premium' ? 'border-2 border-primary' : ''}`}
                      onClick={() => handlePlanChange('premium')}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Premium</CardTitle>
                    <div className="text-2xl font-bold text-primary">€9,99</div>
                    <CardDescription>Al mese</CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <div className="flex items-start">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                      <span>Annunci illimitati</span>
                    </div>
                    <div className="flex items-start">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                      <span>Visibili per 90 giorni</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    {selectedPlan === 'premium' && (
                      <div className="w-full text-center text-sm font-medium text-primary">Selezionato</div>
                    )}
                  </CardFooter>
                </Card>
              </div>
              
              {/* Payment form */}
              <Card>
                <CardHeader>
                  <CardTitle>Completa il tuo acquisto</CardTitle>
                  <CardDescription>Inserisci i dettagli di pagamento per completare l'acquisto</CardDescription>
                </CardHeader>
                <CardContent>
                  <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                    <CheckoutForm selectedPlan={selectedPlan} amount={amount} />
                  </Elements>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}

// Questa funzione viene eseguita solo lato server all'avvio
export async function getServerSideProps(context) {
  return {
    props: {},
  };
}