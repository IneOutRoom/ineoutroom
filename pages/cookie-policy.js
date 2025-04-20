import SEO from './components/SEO';
import { Navbar } from '../client/src/components/layout/navbar';
import { Footer } from '../client/src/components/layout/footer';

export default function CookiePolicyPage() {
  return (
    <>
      <SEO 
        title="Cookie Policy - In&Out"
        description="Informazioni sull'utilizzo dei cookie e di altre tecnologie di tracciamento sul sito In&Out."
        keywords="cookie, tracciamento, privacy, GDPR, dati personali, policy"
        canonical="/cookie-policy"
      />

      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-grow container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-6 md:p-8">
            <h1 className="text-3xl font-bold text-primary mb-6">Cookie Policy</h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-muted-foreground mb-6">
                Ultimo aggiornamento: 18 Aprile 2025
              </p>
              
              <p className="lead">
                Questa Cookie Policy spiega come In&Out ("noi", "nostro") utilizza i cookie e tecnologie simili per riconoscere quando visiti il nostro sito web. Spiega cosa sono queste tecnologie e perché le utilizziamo, oltre alle tue opzioni per controllarle.
              </p>
              
              <h2>1. Cosa sono i Cookie?</h2>
              <p>
                I cookie sono piccoli file di dati che vengono inseriti sul tuo dispositivo quando visiti un sito web. Questi file contengono informazioni che vengono trasferite al tuo dispositivo e consentono al sito di ricordarti e le tue preferenze. I cookie possono essere "persistenti" o "di sessione": i cookie persistenti rimangono sul tuo dispositivo quando ti disconnetti, mentre i cookie di sessione vengono eliminati quando chiudi il browser.
              </p>
              
              <h2>2. Cookie che Utilizziamo</h2>
              <p>
                Utilizziamo diversi tipi di cookie per diversi scopi:
              </p>
              
              <h3>Cookie Essenziali</h3>
              <p>
                Questi cookie sono necessari per il funzionamento del sito e non possono essere disattivati nei nostri sistemi. Generalmente vengono impostati solo in risposta a tue azioni, come l'impostazione delle preferenze di privacy, l'accesso o la compilazione di moduli. Puoi impostare il tuo browser per bloccarli, ma alcune parti del sito potrebbero non funzionare correttamente.
              </p>
              <ul>
                <li><strong>auth_session:</strong> Memorizza le informazioni di autenticazione durante la sessione</li>
                <li><strong>csrf_token:</strong> Previene attacchi CSRF (Cross-Site Request Forgery)</li>
                <li><strong>cookie_consent:</strong> Ricorda le tue preferenze sui cookie</li>
              </ul>
              
              <h3>Cookie Analitici</h3>
              <p>
                Ci permettono di contare le visite e le fonti di traffico per misurare e migliorare le prestazioni del nostro sito. Ci aiutano a sapere quali pagine sono più o meno popolari e come i visitatori si muovono nel sito.
              </p>
              <ul>
                <li><strong>_ga, _gid, _gat:</strong> Cookie di Google Analytics per analizzare come utilizzi il sito</li>
                <li><strong>_fbp:</strong> Cookie di Facebook Pixel per analisi di marketing</li>
              </ul>
              
              <h3>Cookie Funzionali</h3>
              <p>
                Questi cookie consentono al sito di fornire funzionalità e personalizzazione avanzate. Possono essere impostati da noi o da fornitori terzi i cui servizi abbiamo aggiunto alle nostre pagine.
              </p>
              <ul>
                <li><strong>language:</strong> Ricorda le preferenze di lingua</li>
                <li><strong>recent_searches:</strong> Memorizza le tue ricerche recenti</li>
                <li><strong>display_settings:</strong> Memorizza le preferenze di visualizzazione</li>
              </ul>
              
              <h3>Cookie di Marketing</h3>
              <p>
                Questi cookie possono essere impostati attraverso il nostro sito dai nostri partner pubblicitari. Possono essere utilizzati da queste aziende per costruire un profilo dei tuoi interessi e mostrarti annunci pertinenti su altri siti.
              </p>
              <ul>
                <li><strong>ads_id:</strong> Utilizzato per ottimizzare gli annunci pubblicitari</li>
                <li><strong>_gcl_au:</strong> Utilizzato da Google AdSense per testare l'efficienza pubblicitaria</li>
              </ul>
              
              <h2>3. Cookie di Terze Parti</h2>
              <p>
                Oltre ai nostri cookie, consentiamo a terze parti selezionate di inserire cookie sul tuo dispositivo quando visiti il nostro sito. Queste parti includono:
              </p>
              <ul>
                <li><strong>Google:</strong> Per analytics, advertising e reCAPTCHA</li>
                <li><strong>Facebook:</strong> Per funzionalità di condivisione e pubblicità</li>
                <li><strong>Stripe:</strong> Per elaborare i pagamenti</li>
                <li><strong>Mixpanel:</strong> Per l'analisi del comportamento utente</li>
              </ul>
              
              <h2>4. Come Controllare i Cookie</h2>
              <p>
                Puoi gestire le tue preferenze sui cookie in diversi modi:
              </p>
              <ul>
                <li>
                  <strong>Impostazioni del browser:</strong> Puoi gestire i cookie tramite le impostazioni del tuo browser. La maggior parte dei browser ti consente di rifiutare o accettare tutti i cookie, accettare solo determinati tipi di cookie o avvisarti prima di accettare un cookie.
                </li>
                <li>
                  <strong>Impostazioni specifiche del sito:</strong> Puoi gestire le tue preferenze sui cookie sul nostro sito attraverso il banner dei cookie visualizzato quando visiti il sito per la prima volta o tramite il link "Impostazioni Cookie" nel footer.
                </li>
                <li>
                  <strong>Strumenti di terze parti:</strong> Esistono strumenti online come "Your Online Choices" o "Network Advertising Initiative" che consentono di controllare i cookie pubblicitari e di tracciamento.
                </li>
              </ul>
              <p>
                Tieni presente che la limitazione dei cookie potrebbe influire sulla funzionalità del nostro sito e sulla tua esperienza come utente.
              </p>
              
              <h2>5. Altre Tecnologie di Tracciamento</h2>
              <p>
                Oltre ai cookie, potremmo utilizzare altre tecnologie simili:
              </p>
              <ul>
                <li>
                  <strong>Web beacon:</strong> Piccole immagini trasparenti che ci consentono di monitorare se hai visitato una pagina o aperto un'email.
                </li>
                <li>
                  <strong>Pixel di tracciamento:</strong> Utilizzati principalmente per il remarketing e per comprendere i modelli di traffico.
                </li>
                <li>
                  <strong>Local storage:</strong> Permette ai siti web di memorizzare dati localmente sul tuo dispositivo, simile ai cookie ma con maggiore capacità.
                </li>
              </ul>
              
              <h2>6. Aggiornamenti a questa Policy</h2>
              <p>
                Potremmo aggiornare questa Cookie Policy occasionalmente per riflettere, ad esempio, modifiche ai cookie che utilizziamo o per altri motivi operativi, legali o normativi. Ti invitiamo pertanto a visitare regolarmente questa pagina per restare informato sull'uso dei cookie e sulle tecnologie correlate.
              </p>
              <p>
                La data in cima a questa Policy indica quando è stata aggiornata l'ultima volta.
              </p>
              
              <h2>7. Contattaci</h2>
              <p>
                Se hai domande sulla nostra Cookie Policy o su come gestiamo i cookie, contattaci all'indirizzo: <a href="mailto:privacy@ineoutroom.eu" className="text-primary hover:underline">privacy@ineoutroom.eu</a>
              </p>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}