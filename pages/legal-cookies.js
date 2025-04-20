import SEO from './components/SEO';
import { Navbar } from '../client/src/components/layout/navbar';
import { Footer } from '../client/src/components/layout/footer';
import { generateOrganizationSchema, generateWebPageSchema } from '../client/src/components/seo/SchemaGenerator';

export default function LegalCookiesPage() {
  // Genera dati strutturati schema.org per la pagina
  const pageSchemaData = generateWebPageSchema({
    title: "Cookie Policy - In&Out Room",
    description: "Informativa completa sull'utilizzo dei cookie e tecnologie simili sul sito ineoutroom.eu",
    url: "https://ineoutroom.eu/legal-cookies",
    lastUpdated: "2025-04-18"
  });
  
  // Aggiungi dati schema.org dell'organizzazione
  const organizationSchemaData = generateOrganizationSchema();
  
  // Combina i diversi schemi JSON-LD
  const combinedSchemaData = [pageSchemaData, organizationSchemaData];
  
  return (
    <>
      <SEO 
        title="Cookie Policy - In&Out Room"
        description="Informativa completa sull'utilizzo dei cookie e tecnologie simili sul sito ineoutroom.eu. Scopri come gestiamo i cookie e come puoi controllare le tue preferenze."
        keywords="cookie, cookie policy, privacy, dati, tracciamento, In&Out Room, GDPR, normativa cookie"
        canonical="/legal-cookies"
        ogType="article"
        schemaData={combinedSchemaData}
      />

      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-grow container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-6 md:p-8">
            <h1 className="text-3xl font-bold text-primary mb-6">Cookie Policy</h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-muted-foreground mb-6">
                Ultimo aggiornamento: 18 aprile 2025
              </p>
              
              <p>
                La presente Cookie Policy (di seguito, "Policy") descrive i cookie e le altre tecnologie che In&Out S.r.l. utilizza sul sito web <a href="https://ineoutroom.eu" className="text-primary hover:underline">ineoutroom.eu</a> (di seguito, "Sito") e fornisce informazioni su come controllare le proprie preferenze.
              </p>
              
              <h2 id="cosa-sono-cookie">1. Cosa sono i cookie e le tecnologie simili</h2>
              <p>
                I cookie sono piccoli file di testo che i siti web salvano sul dispositivo dell'utente quando vengono visitati. Vengono ampiamente utilizzati per far funzionare i siti web o per farli funzionare in modo più efficiente, nonché per fornire informazioni ai proprietari del sito.
              </p>
              
              <p>
                Oltre ai cookie, utilizziamo anche altre tecnologie simili, come:
              </p>
              <ul>
                <li><strong>Pixel tag (o web beacon):</strong> immagini trasparenti che consentono di registrare il comportamento degli utenti sul Sito;</li>
                <li><strong>JavaScript:</strong> codice che consente di implementare funzionalità complesse sul Sito;</li>
                <li><strong>Local storage:</strong> archivi di dati che risiedono sul dispositivo dell'utente e possono essere utilizzati per memorizzare informazioni.</li>
              </ul>
              
              <h2 id="tipologie-cookie">2. Tipologie di cookie utilizzati</h2>
              <p>
                In base alla durata, i cookie possono essere:
              </p>
              <ul>
                <li><strong>Cookie di sessione:</strong> vengono eliminati quando si chiude il browser;</li>
                <li><strong>Cookie persistenti:</strong> rimangono sul dispositivo per un periodo di tempo predefinito o fino alla cancellazione manuale.</li>
              </ul>
              
              <p>
                In base allo scopo, utilizziamo le seguenti categorie di cookie:
              </p>
              
              <h3>2.1 Cookie tecnici (necessari)</h3>
              <p>
                Questi cookie sono essenziali per il funzionamento del Sito e non possono essere disattivati nei nostri sistemi. Generalmente vengono impostati solo in risposta ad azioni da parte dell'utente che costituiscono una richiesta di servizi, come l'impostazione delle preferenze sulla privacy, l'accesso o la compilazione di moduli. È possibile configurare il proprio browser per bloccare questi cookie, ma in tal caso alcune parti del Sito potrebbero non funzionare correttamente.
              </p>
              <p>
                I cookie tecnici includono:
              </p>
              <ul>
                <li><strong>session_id:</strong> gestisce la sessione dell'utente</li>
                <li><strong>xsrf-token:</strong> previene attacchi di tipo cross-site request forgery</li>
                <li><strong>cookie_consent:</strong> memorizza le preferenze dell'utente sui cookie</li>
                <li><strong>auth_token:</strong> mantiene l'autenticazione dell'utente</li>
              </ul>
              
              <h3>2.2 Cookie analitici</h3>
              <p>
                Questi cookie ci permettono di contare le visite e le fonti di traffico per poter misurare e migliorare le prestazioni del nostro Sito. Ci aiutano a sapere quali pagine sono le più e le meno popolari e a vedere come i visitatori si muovono all'interno del Sito. Tutte le informazioni raccolte da questi cookie sono aggregate e anonimizzate.
              </p>
              <p>
                I cookie analitici utilizzati:
              </p>
              <ul>
                <li><strong>Google Analytics:</strong> _ga, _gid, _gat</li>
                <li><strong>Hotjar:</strong> _hjid, _hjSessionUser, _hjIncludedInPageviewSample</li>
              </ul>
              
              <h3>2.3 Cookie di marketing e profilazione</h3>
              <p>
                Questi cookie possono essere impostati attraverso il nostro Sito dai nostri partner pubblicitari. Possono essere utilizzati da queste aziende per creare un profilo dei tuoi interessi e mostrarti annunci pertinenti su altri siti. Non memorizzano direttamente informazioni personali, ma si basano sull'identificazione univoca del tuo browser e dispositivo Internet.
              </p>
              <p>
                I cookie di marketing utilizzati:
              </p>
              <ul>
                <li><strong>Facebook:</strong> _fbp, fr</li>
                <li><strong>Google Ads:</strong> _gcl_au</li>
              </ul>
              
              <h2 id="base-giuridica">3. Base giuridica per l'utilizzo dei cookie</h2>
              <p>
                La base giuridica per l'utilizzo dei cookie varia a seconda della tipologia:
              </p>
              <ul>
                <li><strong>Cookie tecnici:</strong> legittimo interesse (Art. 6.1.f GDPR) a garantire il corretto funzionamento del Sito;</li>
                <li><strong>Cookie analitici anonimizzati:</strong> legittimo interesse a migliorare il Sito in base all'analisi dell'uso;</li>
                <li><strong>Cookie analitici non anonimizzati e di marketing:</strong> consenso esplicito dell'utente (Art. 6.1.a GDPR).</li>
              </ul>
              
              <h2 id="cookie-terze-parti">4. Cookie di terze parti</h2>
              <p>
                Alcuni cookie sono impostati da servizi di terze parti che compaiono sulle nostre pagine:
              </p>
              <ul>
                <li><strong>Google Analytics:</strong> per analisi statistiche. <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Privacy Policy</a></li>
                <li><strong>Google Maps:</strong> per funzionalità di mappe. <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Privacy Policy</a></li>
                <li><strong>Stripe:</strong> per elaborazione pagamenti. <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Privacy Policy</a></li>
                <li><strong>Facebook Pixel:</strong> per marketing. <a href="https://www.facebook.com/policy.php" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Privacy Policy</a></li>
                <li><strong>Hotjar:</strong> per analisi del comportamento utente. <a href="https://www.hotjar.com/legal/policies/privacy/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Privacy Policy</a></li>
              </ul>
              
              <h2 id="gestione-cookie">5. Come gestire i cookie</h2>
              <p>
                È possibile gestire le preferenze sui cookie in diversi modi:
              </p>
              
              <h3>5.1 Tramite il banner cookie</h3>
              <p>
                Al primo accesso al Sito, viene mostrato un banner che permette di:
              </p>
              <ul>
                <li>Accettare tutti i cookie</li>
                <li>Rifiutare tutti i cookie non necessari</li>
                <li>Personalizzare le preferenze attraverso il pannello di configurazione</li>
              </ul>
              <p>
                Puoi modificare le tue preferenze in qualsiasi momento cliccando sul link "Impostazioni Cookie" presente nel footer del Sito.
              </p>
              
              <h3>5.2 Tramite le impostazioni del browser</h3>
              <p>
                È possibile bloccare o eliminare i cookie anche tramite le impostazioni del browser:
              </p>
              <ul>
                <li>Google Chrome: <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Istruzioni</a></li>
                <li>Mozilla Firefox: <a href="https://support.mozilla.org/it/kb/Attivare%20e%20disattivare%20i%20cookie" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Istruzioni</a></li>
                <li>Safari: <a href="https://support.apple.com/it-it/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Istruzioni</a></li>
                <li>Microsoft Edge: <a href="https://support.microsoft.com/it-it/microsoft-edge/eliminare-i-cookie-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Istruzioni</a></li>
              </ul>
              <p>
                Si noti che la limitazione dei cookie potrebbe influire sulla funzionalità di alcune sezioni del Sito.
              </p>
              
              <h3>5.3 Opt-out specifici per i servizi di analisi e pubblicità</h3>
              <p>
                Per disattivare specificamente i cookie di servizi come Google Analytics, Facebook Pixel e altri, è possibile utilizzare i seguenti link:
              </p>
              <ul>
                <li>Google Analytics: <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Opt-out</a></li>
                <li>Facebook: <a href="https://www.facebook.com/help/568137493302217" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Opt-out</a></li>
                <li>Hotjar: <a href="https://www.hotjar.com/legal/compliance/opt-out" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Opt-out</a></li>
              </ul>
              
              <h2 id="modifiche-policy">6. Modifiche alla Cookie Policy</h2>
              <p>
                La presente Cookie Policy può essere soggetta a modifiche. Eventuali aggiornamenti saranno pubblicati su questa pagina con la relativa data di revisione. Si invita a consultare periodicamente questa pagina per verificare eventuali aggiornamenti.
              </p>
              
              <h2 id="contatti">7. Contatti</h2>
              <p>
                Per qualsiasi domanda o chiarimento relativo alla presente Cookie Policy, è possibile contattare In&Out S.r.l. tramite:
              </p>
              <p>
                Email: <a href="mailto:privacy.ineoutroom@gmail.com" className="text-primary hover:underline">privacy.ineoutroom@gmail.com</a><br />
                Indirizzo: Via Marcaccio 5, Tagliacozzo (AQ) – 67069, Italia
              </p>
              
              <p className="mt-8 text-sm text-muted-foreground italic">
                Data di ultima revisione della presente Cookie Policy: 18 aprile 2025
              </p>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}