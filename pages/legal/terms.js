import SEO from '../components/SEO';
import { Navbar } from '../../client/src/components/layout/navbar';
import { Footer } from '../../client/src/components/layout/footer';

export default function TermsPage() {
  return (
    <>
      <SEO 
        title="Termini e Condizioni di Utilizzo - In&Out"
        description="Termini e condizioni per l'utilizzo della piattaforma In&Out per la ricerca di stanze e alloggi in Europa."
        keywords="termini, condizioni, utilizzo, legali, regolamento, In&Out, contratto"
        canonical="/legal/terms"
      />

      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-grow container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-6 md:p-8">
            <h1 className="text-3xl font-bold text-primary mb-6">Termini e Condizioni di Utilizzo</h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-muted-foreground mb-6">
                Ultimo aggiornamento: 18 Aprile 2025
              </p>
              
              <h2>1. Definizioni</h2>
              <p>
                Ai fini dei presenti Termini e Condizioni, i seguenti termini hanno il significato di seguito indicato:
              </p>
              <ul>
                <li><strong>"Piattaforma"</strong>: il sito web In&Out, accessibile all'indirizzo www.inoutrooms.eu e relative applicazioni mobili;</li>
                <li><strong>"Utente"</strong>: qualsiasi soggetto che accede, naviga o utilizza la Piattaforma;</li>
                <li><strong>"Inserzionista"</strong>: l'Utente che pubblica annunci di proprietà sulla Piattaforma;</li>
                <li><strong>"Inquilino"</strong>: l'Utente che cerca alloggi sulla Piattaforma;</li>
                <li><strong>"Contenuto"</strong>: qualsiasi materiale caricato sulla Piattaforma, inclusi testi, immagini, video, informazioni e comunicazioni.</li>
              </ul>
              
              <h2>2. Oggetto del contratto</h2>
              <p>
                In&Out è una piattaforma online che consente agli Utenti di pubblicare e cercare annunci relativi a stanze e alloggi in Europa. La Piattaforma offre strumenti di ricerca avanzata, sistema di messaggistica, gestione delle prenotazioni e altre funzionalità connesse alla locazione di immobili.
              </p>
              <p>
                La Piattaforma agisce esclusivamente come intermediario tecnologico tra gli Utenti e non è parte di alcun contratto di locazione stipulato tra Inserzionisti e Inquilini.
              </p>
              
              <h2>3. Registrazione e accesso</h2>
              <p>
                Per utilizzare alcune funzionalità della Piattaforma, è necessario registrarsi creando un account personale.
              </p>
              <p>
                L'Utente garantisce che le informazioni fornite in fase di registrazione sono accurate, complete e aggiornate. In caso di modifica di tali informazioni, l'Utente si impegna ad aggiornare tempestivamente il proprio profilo.
              </p>
              <p>
                L'Utente è responsabile della riservatezza delle proprie credenziali di accesso e di tutte le attività che avvengono utilizzando il proprio account. In caso di sospetto accesso non autorizzato, l'Utente deve informare immediatamente In&Out.
              </p>
              <p>
                In&Out si riserva il diritto di sospendere o terminare l'account di un Utente in caso di violazione dei presenti Termini o di comportamenti fraudolenti.
              </p>
              
              <h2>4. Obblighi e divieti dell'utente</h2>
              <p>
                Utilizzando la Piattaforma, l'Utente si impegna a:
              </p>
              <ul>
                <li>Rispettare tutte le leggi e i regolamenti applicabili;</li>
                <li>Pubblicare annunci veritieri e accurati, in caso sia un Inserzionista;</li>
                <li>Non utilizzare la Piattaforma per scopi illeciti o fraudolenti;</li>
                <li>Non pubblicare contenuti offensivi, diffamatori, discriminatori o illegali;</li>
                <li>Non interferire con il normale funzionamento della Piattaforma;</li>
                <li>Non tentare di accedere a aree riservate della Piattaforma;</li>
                <li>Non creare account multipli o falsi;</li>
                <li>Non divulgare dati personali di altri Utenti senza autorizzazione;</li>
                <li>Non utilizzare bot, crawler o altri strumenti automatizzati per la raccolta di dati.</li>
              </ul>
              
              <h2>5. Proprietà intellettuale</h2>
              <p>
                Tutti i diritti di proprietà intellettuale relativi alla Piattaforma e ai suoi contenuti originali sono di proprietà esclusiva di In&Out o dei suoi licenzianti. Tali diritti includono, a titolo esemplificativo ma non esaustivo, copyright, marchi, loghi, design, software, database e know-how.
              </p>
              <p>
                L'Utente riceve una licenza limitata, non esclusiva, non trasferibile e revocabile per utilizzare la Piattaforma per scopi personali e non commerciali, nel rispetto dei presenti Termini.
              </p>
              <p>
                Caricando Contenuti sulla Piattaforma, l'Utente concede a In&Out una licenza mondiale, non esclusiva, gratuita, trasferibile e sub-licenziabile per utilizzare, riprodurre, modificare, adattare, pubblicare e distribuire tali Contenuti in relazione al funzionamento della Piattaforma.
              </p>
              
              <h2>6. Limitazione di responsabilità</h2>
              <p>
                La Piattaforma è fornita "così com'è" e "come disponibile", senza garanzie di alcun tipo, esplicite o implicite.
              </p>
              <p>
                In&Out non garantisce:
              </p>
              <ul>
                <li>L'accuratezza, completezza o affidabilità delle informazioni presenti sulla Piattaforma;</li>
                <li>La disponibilità continua e ininterrotta della Piattaforma;</li>
                <li>L'assenza di errori o difetti nel software;</li>
                <li>La sicurezza completa dai virus informatici o altri codici dannosi.</li>
              </ul>
              <p>
                In&Out non è responsabile per eventuali danni diretti, indiretti, incidentali, conseguenti o punitivi derivanti dall'utilizzo o dall'impossibilità di utilizzare la Piattaforma.
              </p>
              <p>
                In&Out non è responsabile per le azioni o omissioni degli Utenti, né per la qualità, sicurezza o legalità degli alloggi pubblicizzati.
              </p>
              
              <h2>7. Forza maggiore</h2>
              <p>
                In&Out non sarà responsabile per eventuali ritardi o inadempimenti nell'esecuzione delle sue obbligazioni se tali ritardi o inadempimenti sono causati da circostanze al di fuori del ragionevole controllo di In&Out, inclusi, a titolo esemplificativo ma non esaustivo, calamità naturali, atti terroristici, guerre, rivolte, epidemie, pandemie, interruzioni delle comunicazioni o dell'energia, scioperi o problemi di lavoro, restrizioni o ritardi che interessano i vettori, o atti o omissioni di terze parti.
              </p>
              
              <h2>8. Durata, recesso e sospensione del servizio</h2>
              <p>
                I presenti Termini rimangono in vigore finché l'Utente continua a utilizzare la Piattaforma o fino alla chiusura del proprio account.
              </p>
              <p>
                L'Utente può recedere dai presenti Termini in qualsiasi momento chiudendo il proprio account o cessando di utilizzare la Piattaforma.
              </p>
              <p>
                In&Out si riserva il diritto di sospendere o terminare l'accesso di un Utente alla Piattaforma, in qualsiasi momento e senza preavviso, in caso di violazione dei presenti Termini o per qualsiasi altro motivo a sua discrezione.
              </p>
              <p>
                In&Out può interrompere, modificare o sospendere temporaneamente o permanentemente la Piattaforma o qualsiasi sua funzionalità, senza preavviso e senza responsabilità verso l'Utente.
              </p>
              
              <h2>9. Modifiche ai Termini</h2>
              <p>
                In&Out si riserva il diritto di modificare i presenti Termini in qualsiasi momento, a sua esclusiva discrezione.
              </p>
              <p>
                Le modifiche entreranno in vigore immediatamente dopo la pubblicazione dei Termini aggiornati sulla Piattaforma. L'uso continuato della Piattaforma dopo tali modifiche costituisce l'accettazione dei nuovi Termini.
              </p>
              <p>
                È responsabilità dell'Utente controllare regolarmente i Termini per verificare eventuali aggiornamenti. In caso di modifiche sostanziali, In&Out informerà gli Utenti tramite notifica sulla Piattaforma o via email.
              </p>
              
              <h2>10. Legge applicabile e Foro competente</h2>
              <p>
                I presenti Termini sono regolati e interpretati secondo la legge italiana, in conformità all'art. 1321 e seguenti del Codice Civile e al Regolamento UE 2016/679 (GDPR) per quanto riguarda il trattamento dei dati personali.
              </p>
              <p>
                Per qualsiasi controversia relativa ai presenti Termini o all'utilizzo della Piattaforma, il Foro competente è quello di Milano, fatto salvo quanto previsto dalle norme a tutela dei consumatori.
              </p>
              <p>
                Ai sensi e per gli effetti degli articoli 1341 e 1342 del Codice Civile italiano, l'Utente dichiara di aver letto e compreso specificamente, e quindi di approvare espressamente, le seguenti clausole: 4 (Obblighi e divieti dell'utente), 6 (Limitazione di responsabilità), 7 (Forza maggiore), 8 (Durata, recesso e sospensione del servizio), 9 (Modifiche ai Termini), 10 (Legge applicabile e Foro competente).
              </p>
              
              <h2>Contatti</h2>
              <p>
                Per qualsiasi domanda o chiarimento sui presenti Termini, contattare:
              </p>
              <p>
                In&Out S.r.l.<br />
                Via Roma 123<br />
                20100 Milano, Italia<br />
                Email: <a href="mailto:legal@inoutrooms.eu" className="text-primary hover:underline">legal@inoutrooms.eu</a>
              </p>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}