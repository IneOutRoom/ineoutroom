import { useEffect, useState } from 'react';
import Shepherd from 'shepherd.js';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useLocation, useRoute } from 'wouter';
import { Button } from '@/components/ui/button';

interface OnboardingTourProps {
  isFirstLogin?: boolean;
  startManually?: boolean;
}

export function OnboardingTour({ isFirstLogin = false, startManually = false }: OnboardingTourProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const [isActive, setIsActive] = useState(false);
  const [tourInstance, setTourInstance] = useState<Shepherd.Tour | null>(null);
  const [matchSearch] = useRoute('/search');
  const [matchPropertySearch] = useRoute('/property-search');

  // Inizializza il tour
  useEffect(() => {
    // Funzioni per le promise
    const navigateToSearch = (): Promise<void> => {
      return new Promise<void>((resolve) => {
        if (!matchSearch && !matchPropertySearch) {
          setLocation('/search');
          // Attendiamo che la pagina di ricerca sia caricata
          setTimeout(resolve, 1000);
        } else {
          resolve();
        }
      });
    };

    // Creazione dell'istanza del tour
    const tour = new Shepherd.Tour({
      defaultStepOptions: {
        cancelIcon: {
          enabled: true
        },
        classes: 'shepherd-theme-custom',
        scrollTo: { behavior: 'smooth', block: 'center' },
        modalOverlayOpeningRadius: 4
      },
      useModalOverlay: true
    });

    // STEP 1: Introduzione e Navigazione
    tour.addStep({
      id: 'welcome',
      text: `
        <div class="p-2">
          <h3 class="text-lg font-semibold mb-2 text-[#6a0dad]">Benvenuto su In&Out!</h3>
          <p class="mb-3">La piattaforma che ti aiuta a trovare il tuo alloggio ideale in Europa.</p>
          <p>Ti guideremo attraverso le principali funzionalità per aiutarti a iniziare.</p>
        </div>
      `,
      attachTo: {
        element: 'header',
        on: 'bottom'
      },
      buttons: [
        {
          action() { tour.cancel(); },
          text: 'Salta tour',
          classes: 'shepherd-button-secondary'
        },
        {
          action() { tour.next(); },
          text: 'Iniziamo!',
          classes: 'shepherd-button-primary bg-[#6a0dad] hover:bg-[#580b91]'
        }
      ]
    });

    // STEP 2: Ricerca alloggi
    tour.addStep({
      id: 'search',
      text: `
        <div class="p-2">
          <h3 class="text-lg font-semibold mb-2 text-[#6a0dad]">Ricerca alloggi</h3>
          <p class="mb-3">Trova facilmente l'alloggio perfetto inserendo la città, il tipo di proprietà e le tue preferenze.</p>
          <p>Puoi utilizzare la barra di ricerca per trovare alloggi in tutta Europa.</p>
        </div>
      `,
      attachTo: {
        element: '.search-box-container',
        on: 'bottom'
      },
      beforeShowPromise: navigateToSearch,
      buttons: [
        {
          action() { tour.back(); },
          text: 'Indietro',
          classes: 'shepherd-button-secondary'
        },
        {
          action() { tour.next(); },
          text: 'Avanti',
          classes: 'shepherd-button-primary bg-[#6a0dad] hover:bg-[#580b91]'
        }
      ]
    });

    // STEP 3: Filtri di ricerca
    tour.addStep({
      id: 'filters',
      text: `
        <div class="p-2">
          <h3 class="text-lg font-semibold mb-2 text-[#6a0dad]">Filtra i risultati</h3>
          <p class="mb-3">Utilizza i filtri per affinare la ricerca in base al tuo budget, alle caratteristiche dell'alloggio e alla posizione.</p>
          <p>Puoi anche visualizzare i risultati nella modalità mappa per vedere la posizione esatta.</p>
        </div>
      `,
      attachTo: {
        element: '.filter-bar',
        on: 'bottom'
      },
      beforeShowPromise: navigateToSearch,
      buttons: [
        {
          action() { tour.back(); },
          text: 'Indietro',
          classes: 'shepherd-button-secondary'
        },
        {
          action() { tour.next(); },
          text: 'Avanti',
          classes: 'shepherd-button-primary bg-[#6a0dad] hover:bg-[#580b91]'
        }
      ]
    });

    // STEP 4: Vista Mappa
    tour.addStep({
      id: 'map-view',
      text: `
        <div class="p-2">
          <h3 class="text-lg font-semibold mb-2 text-[#6a0dad]">Visualizzazione mappa</h3>
          <p class="mb-3">Passa alla vista mappa per vedere tutti gli alloggi disponibili nella zona che ti interessa.</p>
          <p>Puoi fare clic sui marker sulla mappa per visualizzare i dettagli dell'alloggio.</p>
        </div>
      `,
      attachTo: {
        element: '.map-view-button',
        on: 'left'
      },
      beforeShowPromise: navigateToSearch,
      buttons: [
        {
          action() { tour.back(); },
          text: 'Indietro',
          classes: 'shepherd-button-secondary'
        },
        {
          action() { tour.next(); },
          text: 'Avanti',
          classes: 'shepherd-button-primary bg-[#6a0dad] hover:bg-[#580b91]'
        }
      ]
    });

    // STEP 5: Messaggi
    tour.addStep({
      id: 'messages',
      text: `
        <div class="p-2">
          <h3 class="text-lg font-semibold mb-2 text-[#6a0dad]">Chat e messaggi</h3>
          <p class="mb-3">Puoi comunicare direttamente con i proprietari degli alloggi per avere maggiori informazioni o organizzare una visita.</p>
          <p>I tuoi messaggi saranno sempre accessibili dalla sezione "Messaggi" nel menu principale.</p>
        </div>
      `,
      attachTo: {
        element: '.messages-link',
        on: 'bottom'
      },
      buttons: [
        {
          action() { tour.back(); },
          text: 'Indietro',
          classes: 'shepherd-button-secondary'
        },
        {
          action() { tour.next(); },
          text: 'Avanti',
          classes: 'shepherd-button-primary bg-[#6a0dad] hover:bg-[#580b91]'
        }
      ]
    });

    // STEP 6: Pubblicazione annuncio
    tour.addStep({
      id: 'publish',
      text: `
        <div class="p-2">
          <h3 class="text-lg font-semibold mb-2 text-[#6a0dad]">Pubblica il tuo annuncio</h3>
          <p class="mb-3">Hai una stanza o un appartamento da affittare? Puoi pubblicare facilmente il tuo annuncio sulla piattaforma.</p>
          <p>Utilizza il nostro generatore AI per creare descrizioni professionali che attirino i potenziali inquilini.</p>
        </div>
      `,
      attachTo: {
        element: '.publish-link',
        on: 'bottom'
      },
      buttons: [
        {
          action() { tour.back(); },
          text: 'Indietro',
          classes: 'shepherd-button-secondary'
        },
        {
          action() { tour.next(); },
          text: 'Completa tour',
          classes: 'shepherd-button-primary bg-[#6a0dad] hover:bg-[#580b91]'
        }
      ]
    });

    // STEP 7: Conclusione
    tour.addStep({
      id: 'conclusion',
      text: `
        <div class="p-2">
          <h3 class="text-lg font-semibold mb-2 text-[#6a0dad]">Tour completato!</h3>
          <p class="mb-3">Ora sei pronto per utilizzare In&Out al massimo delle sue potenzialità.</p>
          <p>Puoi rivedere questo tour in qualsiasi momento dalla pagina del tuo profilo.</p>
        </div>
      `,
      buttons: [
        {
          action() { tour.complete(); },
          text: 'Inizia a esplorare',
          classes: 'shepherd-button-primary bg-[#6a0dad] hover:bg-[#580b91]'
        }
      ]
    });

    // Eventi del tour
    tour.on('complete', () => {
      setIsActive(false);
      toast({
        title: "Tour completato!",
        description: "Ora puoi esplorare In&Out in autonomia",
      });
      
      // Aggiorna le informazioni dell'utente per evitare che il tour venga mostrato di nuovo
      // L'implementazione esatta dipende dalla logica di gestione dell'utente
      // apiRequest('POST', '/api/user/preferences', { completedOnboarding: true });
    });

    tour.on('cancel', () => {
      setIsActive(false);
      toast({
        title: "Tour saltato",
        description: "Puoi sempre rivedere il tour dal tuo profilo",
      });
    });

    setTourInstance(tour);

    return () => {
      if (tour && tour.isActive()) {
        tour.cancel();
      }
    };
  }, [matchSearch, matchPropertySearch, setLocation, toast]);

  // Avvia il tour quando il componente viene montato (solo per il primo login)
  useEffect(() => {
    if (!tourInstance) return;

    if (isFirstLogin || startManually) {
      setIsActive(true);
      tourInstance.start();
    }
  }, [tourInstance, isFirstLogin, startManually]);

  const startTour = () => {
    if (tourInstance && !isActive) {
      setIsActive(true);
      tourInstance.start();
    }
  };

  // Renderizza un pulsante se il tour deve essere avviato manualmente
  return (
    <>
      {startManually && !isActive && (
        <Button 
          onClick={startTour}
          className="bg-[#6a0dad] hover:bg-[#580b91] text-white"
        >
          Avvia il tour
        </Button>
      )}
    </>
  );
}