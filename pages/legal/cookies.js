import SEO from '../components/SEO';
import { Navbar } from '../../client/src/components/layout/navbar';
import { Footer } from '../../client/src/components/layout/footer';

export default function CookiesPage() {
  return (
    <>
      <SEO 
        title="Cookie Policy - In&Out"
        description="Informativa completa sull'utilizzo dei cookie e di altre tecnologie di tracciamento sul sito In&Out."
        keywords="cookie, tracciamento, privacy, GDPR, dati personali, policy, tecnologie di tracciamento"
        canonical="/legal/cookies"
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
                La presente Cookie Policy spiega come In&Out S.r.l. (di seguito "In&Out", "noi" o "nostro") utilizza i cookie e tecnologie simili sul sito web www.inoutrooms.eu e relative applicazioni (di seguito collettivamente "Piattaforma"). Ti invitiamo a leggere attentamente questo documento per comprendere come trattiamo queste informazioni.
              </p>
              
              <h2>1. Cosa sono i cookie</h2>
              <p>
                I cookie sono piccoli file di testo che i siti web visitati dall'utente inviano al suo terminale (computer, tablet, smartphone, notebook), dove vengono memorizzati per essere poi ritrasmessi agli stessi siti alla successiva visita del medesimo utente.
              </p>
              <p>
                I cookie permettono a un sito web di riconoscere il dispositivo dell'utente, tracciare la sua navigazione attraverso le diverse pagine del sito e identificare gli utenti che ritornano sul sito.
              </p>
              
              <h2>2. Tipologie di cookie</h2>
              <p>
                La Piattaforma utilizza diverse tipologie di cookie, che possono essere classificati come segue:
              </p>
              
              <h3>a) In base al soggetto che li gestisce</h3>
              <ul>
                <li>
                  <strong>Cookie di prima parte:</strong> impostati direttamente da In&Out sul dispositivo dell'utente.
                </li>
                <li>
                  <strong>Cookie di terze parti:</strong> impostati da domini diversi dalla Piattaforma, come i cookie utilizzati da servizi di analisi, mappe, social media o servizi pubblicitari.
                </li>
              </ul>
              
              <h3>b) In base alla durata</h3>
              <ul>
                <li>
                  <strong>Cookie di sessione:</strong> cancellati automaticamente quando si chiude il browser.
                </li>
                <li>
                  <strong>Cookie persistenti:</strong> rimangono memorizzati sul dispositivo dell'utente fino alla loro scadenza o cancellazione manuale.
                </li>
              </ul>
              
              <h3>c) In base alla finalità</h3>
              <ul>
                <li>
                  <strong>Cookie tecnici:</strong> necessari per il corretto funzionamento della Piattaforma. Includono i cookie strettamente necessari, quelli funzionali e quelli analytics se anonimizzati.
                </li>
                <li>
                  <strong>Cookie analitici:</strong> utilizzati per raccogliere informazioni statistiche sull'utilizzo della Piattaforma, come il numero di visitatori, le pagine visitate, la fonte del traffico e il tempo trascorso sul sito.
                </li>
                <li>
                  <strong>Cookie di profilazione:</strong> utilizzati per tracciare la navigazione dell'utente e creare profili sulle sue preferenze, abitudini, scelte, ecc. Questi cookie permettono di inviare messaggi pubblicitari in linea con le preferenze manifestate dall'utente durante la navigazione.
                </li>
                <li>
                  <strong>Cookie di marketing:</strong> utilizzati per monitorare i visitatori nei siti web e presentare pubblicità pertinente e coinvolgente per il singolo utente.
                </li>
              </ul>
              
              <h2>3. Finalità</h2>
              <p>
                Utilizziamo i cookie per:
              </p>
              <ul>
                <li>Garantire il corretto funzionamento della Piattaforma;</li>
                <li>Salvare le preferenze degli utenti e ottimizzare l'esperienza di navigazione;</li>
                <li>Raccogliere dati statistici anonimi sull'utilizzo della Piattaforma per migliorare i servizi offerti;</li>
                <li>Consentire l'autenticazione degli utenti e la gestione delle sessioni;</li>
                <li>Fornire funzionalità di condivisione sui social network;</li>
                <li>Mostrare pubblicità personalizzata in base agli interessi degli utenti;</li>
                <li>Prevenire attività fraudolente e migliorare la sicurezza;</li>
                <li>Analizzare e misurare l'efficacia delle nostre campagne di marketing.</li>
              </ul>
              
              <h2>4. Durata di conservazione</h2>
              <p>
                La durata dei cookie varia in base alla loro tipologia:
              </p>
              <ul>
                <li>I cookie di sessione scadono quando l'utente chiude il browser;</li>
                <li>I cookie persistenti hanno date di scadenza variabili, tipicamente da 30 giorni fino a 2 anni.</li>
              </ul>
              <p>
                La tabella dettagliata nella sezione 6 specifica la durata di conservazione per ciascun cookie utilizzato dalla nostra Piattaforma.
              </p>
              
              <h2>5. Come disabilitarli</h2>
              <p>
                È possibile gestire le preferenze relative ai cookie direttamente dal proprio browser:
              </p>
              <ul>
                <li>
                  <strong>Google Chrome:</strong> Menu → Impostazioni → Mostra impostazioni avanzate → Privacy → Impostazioni contenuti → Cookie → Blocca cookie di terze parti e dati dei siti
                </li>
                <li>
                  <strong>Mozilla Firefox:</strong> Menu → Opzioni → Privacy → Cronologia → Impostazioni personalizzate → Cookie → Accetta i cookie di terze parti: mai
                </li>
                <li>
                  <strong>Microsoft Edge:</strong> Menu → Impostazioni → Cookie → Blocca tutti i cookie o Blocca solo i cookie di terze parti
                </li>
                <li>
                  <strong>Safari:</strong> Preferenze → Privacy → Cookie e dati di siti web → Blocca tutti i cookie o Blocca cookie di terze parti e dati di siti
                </li>
                <li>
                  <strong>Opera:</strong> Preferenze → Avanzate → Cookie → Accetta i cookie → Mai
                </li>
              </ul>
              <p>
                È possibile anche utilizzare strumenti di gestione dei cookie di terze parti come:
              </p>
              <ul>
                <li>
                  <a href="http://www.youronlinechoices.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Your Online Choices</a> per la gestione dei cookie pubblicitari;
                </li>
                <li>
                  <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Analytics Opt-out Browser Add-on</a> per disattivare il tracciamento di Google Analytics;
                </li>
                <li>
                  <a href="https://www.networkadvertising.org/choices/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Network Advertising Initiative</a> per gestire cookie pubblicitari di diverse reti.
                </li>
              </ul>
              <p>
                Si prega di notare che la disabilitazione di alcuni cookie potrebbe compromettere il corretto funzionamento della Piattaforma o limitare la disponibilità di alcune funzionalità.
              </p>
              
              <h2>6. Elenco dei cookie utilizzati</h2>
              <p>
                Di seguito l'elenco dettagliato dei cookie utilizzati sulla nostra Piattaforma:
              </p>
              
              <h3>Cookie tecnici (strettamente necessari)</h3>
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="py-2 border">Nome</th>
                    <th className="py-2 border">Provider</th>
                    <th className="py-2 border">Durata</th>
                    <th className="py-2 border">Finalità</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2 border">session_id</td>
                    <td className="py-2 border">inoutrooms.eu</td>
                    <td className="py-2 border">Sessione</td>
                    <td className="py-2 border">Conserva gli stati dell'utente nelle diverse pagine del sito</td>
                  </tr>
                  <tr>
                    <td className="py-2 border">XSRF-TOKEN</td>
                    <td className="py-2 border">inoutrooms.eu</td>
                    <td className="py-2 border">1 giorno</td>
                    <td className="py-2 border">Garantisce la sicurezza della navigazione impedendo attacchi CSRF</td>
                  </tr>
                  <tr>
                    <td className="py-2 border">cookie_consent</td>
                    <td className="py-2 border">inoutrooms.eu</td>
                    <td className="py-2 border">1 anno</td>
                    <td className="py-2 border">Memorizza le preferenze sui cookie dell'utente</td>
                  </tr>
                </tbody>
              </table>
              
              <h3>Cookie analitici</h3>
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="py-2 border">Nome</th>
                    <th className="py-2 border">Provider</th>
                    <th className="py-2 border">Durata</th>
                    <th className="py-2 border">Finalità</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2 border">_ga</td>
                    <td className="py-2 border">Google</td>
                    <td className="py-2 border">2 anni</td>
                    <td className="py-2 border">Registra un ID univoco utilizzato per generare dati statistici su come il visitatore utilizza il sito</td>
                  </tr>
                  <tr>
                    <td className="py-2 border">_gid</td>
                    <td className="py-2 border">Google</td>
                    <td className="py-2 border">24 ore</td>
                    <td className="py-2 border">Registra un ID univoco utilizzato per generare dati statistici su come il visitatore utilizza il sito</td>
                  </tr>
                  <tr>
                    <td className="py-2 border">_gat</td>
                    <td className="py-2 border">Google</td>
                    <td className="py-2 border">1 minuto</td>
                    <td className="py-2 border">Utilizzato da Google Analytics per limitare la frequenza delle richieste</td>
                  </tr>
                </tbody>
              </table>
              
              <h3>Cookie di marketing</h3>
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="py-2 border">Nome</th>
                    <th className="py-2 border">Provider</th>
                    <th className="py-2 border">Durata</th>
                    <th className="py-2 border">Finalità</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2 border">_fbp</td>
                    <td className="py-2 border">Facebook</td>
                    <td className="py-2 border">3 mesi</td>
                    <td className="py-2 border">Utilizzato da Facebook per fornire una serie di prodotti pubblicitari</td>
                  </tr>
                  <tr>
                    <td className="py-2 border">_gcl_au</td>
                    <td className="py-2 border">Google AdSense</td>
                    <td className="py-2 border">3 mesi</td>
                    <td className="py-2 border">Utilizzato da Google AdSense per sperimentare l'efficienza pubblicitaria</td>
                  </tr>
                </tbody>
              </table>
              
              <h2>7. Aggiornamenti della Cookie Policy</h2>
              <p>
                La presente Cookie Policy potrebbe essere soggetta a modifiche nel tempo. Qualsiasi modifica sostanziale verrà comunicata agli utenti tramite un avviso sulla Piattaforma. Ti invitiamo a consultare periodicamente questa pagina per verificare eventuali aggiornamenti.
              </p>
              <p>
                La data in alto a questa pagina indica l'ultima versione della Cookie Policy.
              </p>
              
              <h2>8. Contattaci</h2>
              <p>
                Se hai domande o dubbi riguardo la nostra Cookie Policy o il modo in cui utilizziamo i cookie, ti preghiamo di contattarci:
              </p>
              <p>
                In&Out S.r.l.<br />
                Via Roma 123<br />
                20100 Milano, Italia<br />
                Email: <a href="mailto:privacy@inoutrooms.eu" className="text-primary hover:underline">privacy@inoutrooms.eu</a>
              </p>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}