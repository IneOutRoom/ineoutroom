import SEO from './components/SEO';
import { Navbar } from '../client/src/components/layout/navbar';
import { Footer } from '../client/src/components/layout/footer';
import { generateOrganizationSchema, generateWebPageSchema } from '../client/src/components/seo/SchemaGenerator';

export default function LegalPrivacyPage() {
  // Genera dati strutturati schema.org per la pagina
  const pageSchemaData = generateWebPageSchema({
    title: "Informativa sulla Privacy - In&Out Room",
    description: "Informativa sulla privacy e sul trattamento dei dati personali per gli utenti della piattaforma In&Out Room.",
    url: "https://ineoutroom.eu/legal-privacy",
    lastUpdated: "2025-04-18"
  });
  
  // Aggiungi dati schema.org dell'organizzazione
  const organizationSchemaData = generateOrganizationSchema();
  
  // Combina i diversi schemi JSON-LD
  const combinedSchemaData = [pageSchemaData, organizationSchemaData];
  
  return (
    <>
      <SEO 
        title="Informativa sulla Privacy - In&Out Room"
        description="Informativa completa sul trattamento dei dati personali per gli utenti della piattaforma In&Out Room. Scopri come vengono trattati i tuoi dati e quali sono i tuoi diritti secondo il GDPR."
        keywords="privacy, dati personali, GDPR, trattamento dati, diritti utente, In&Out Room, protezione dati"
        canonical="/legal-privacy"
        ogType="article"
        schemaData={combinedSchemaData}
      />

      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-grow container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-6 md:p-8">
            <h1 className="text-3xl font-bold text-primary mb-6">Informativa sulla Privacy</h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-muted-foreground mb-6">
                Ultimo aggiornamento: 18 aprile 2025
              </p>
              
              <p>
                La presente Informativa sulla Privacy (di seguito, "Informativa") descrive le modalità di trattamento dei dati personali degli utenti che utilizzano il sito web In&Out Room (di seguito, "Sito") disponibile all'indirizzo <a href="https://ineoutroom.eu" className="text-primary hover:underline">https://ineoutroom.eu</a> e i relativi servizi offerti da:
              </p>
              
              <p className="pl-4 border-l-4 border-primary">
                In&Out S.r.l.<br />
                Sede legale: Via Marcaccio 5, Tagliacozzo (AQ) – 67069<br />
                P. IVA: IT02167900667<br />
                Email: <a href="mailto:privacy.ineoutroom@gmail.com" className="text-primary hover:underline">privacy.ineoutroom@gmail.com</a>
              </p>
              
              <p>
                In&Out S.r.l. è il Titolare del trattamento ai sensi dell'art. 4 del Regolamento UE 2016/679 (GDPR).
              </p>
              
              <h2 id="dati-trattati">1. Dati oggetto di trattamento</h2>
              <p>
                <strong>1.1 Dati di navigazione</strong><br />
                I sistemi informatici e i software che garantiscono il funzionamento del Sito acquisiscono, durante il normale esercizio, alcuni dati personali la cui trasmissione è implicita nell'uso dei protocolli di comunicazione Internet. Questi dati (log files, indirizzi IP, browser, data e ora di accesso, ecc.) non sono accompagnati da informazioni personali aggiuntive e vengono utilizzati per:
              </p>
              <ul>
                <li>Ottenere statistiche anonime sull'uso del Sito;</li>
                <li>Controllare il corretto funzionamento del Sito;</li>
                <li>Individuare anomalie e/o abusi.</li>
              </ul>
              
              <p>
                <strong>1.2 Dati forniti volontariamente</strong><br />
                Durante l'utilizzo del Sito possono essere conferiti volontariamente alcuni dati personali, tra cui:
              </p>
              <ul>
                <li>Per la registrazione al Sito: nome, cognome, email, password;</li>
                <li>Per la pubblicazione di annunci: indirizzo degli immobili, foto, descrizioni, prezzi, disponibilità;</li>
                <li>Per i pagamenti: i dati vengono elaborati dai fornitori di servizi di pagamento (PayPal, Stripe) senza che In&Out Room vi abbia accesso;</li>
                <li>Per contatti e assistenza: email, messaggi, eventuali altre informazioni fornite;</li>
                <li>Per migliorare l'esperienza: preferenze di notifica, cronologia di navigazione sul Sito.</li>
              </ul>
              
              <h2 id="finalita-trattamento">2. Finalità e base giuridica del trattamento</h2>
              <p>
                I dati personali sono trattati per le seguenti finalità:
              </p>
              
              <p>
                <strong>2.1 Esecuzione del contratto (art. 6, par. 1, lett. b) GDPR)</strong>
              </p>
              <ul>
                <li>Consentire la registrazione e la creazione di un account;</li>
                <li>Permettere la pubblicazione di annunci;</li>
                <li>Facilitare l'incontro tra domanda e offerta di alloggi;</li>
                <li>Gestire i pagamenti per i Piani di Pubblicazione;</li>
                <li>Fornire assistenza e rispondere alle richieste degli utenti.</li>
              </ul>
              
              <p>
                <strong>2.2 Legittimo interesse (art. 6, par. 1, lett. f) GDPR)</strong>
              </p>
              <ul>
                <li>Garantire la sicurezza del Sito e prevenire frodi;</li>
                <li>Migliorare e ottimizzare il Sito e i servizi offerti;</li>
                <li>Svolgere analisi statistiche in forma aggregata e anonima;</li>
                <li>Tutelare i diritti del titolare in sede giudiziaria.</li>
              </ul>
              
              <p>
                <strong>2.3 Consenso (art. 6, par. 1, lett. a) GDPR)</strong>
              </p>
              <ul>
                <li>Invio di comunicazioni di marketing, newsletter e offerte commerciali;</li>
                <li>Profilazione per suggerimenti personalizzati di annunci;</li>
                <li>Uso di cookie non tecnici (come descritto nella Cookie Policy).</li>
              </ul>
              
              <h2 id="modalita-trattamento">3. Modalità del trattamento</h2>
              <p>
                I dati personali sono trattati con strumenti prevalentemente automatizzati per il tempo strettamente necessario a conseguire le finalità per le quali sono raccolti. Sono adottate specifiche misure di sicurezza per prevenire la perdita, usi illeciti o non corretti, e accessi non autorizzati.
              </p>
              
              <h2 id="periodo-conservazione">4. Periodo di conservazione dei dati</h2>
              <p>
                I dati personali sono conservati per periodi differenti a seconda della finalità:
              </p>
              <ul>
                <li><strong>Dati di account:</strong> per tutta la durata dell'account e per 12 mesi dopo la disattivazione;</li>
                <li><strong>Dati degli annunci:</strong> per la durata di pubblicazione dell'annuncio e per 6 mesi dopo la rimozione;</li>
                <li><strong>Dati per adempimenti legali:</strong> secondo i termini di legge (generalmente 10 anni per i dati fiscali);</li>
                <li><strong>Dati di navigazione:</strong> massimo 90 giorni, salvo eventuali necessità di accertamento di reati;</li>
                <li><strong>Dati per marketing:</strong> fino alla revoca del consenso e, in ogni caso, non oltre 24 mesi dall'ultima interazione.</li>
              </ul>
              
              <h2 id="condivisione-dati">5. Comunicazione e diffusione dei dati</h2>
              <p>
                I dati personali potranno essere condivisi con:
              </p>
              <ul>
                <li><strong>Persone autorizzate:</strong> dipendenti e collaboratori di In&Out S.r.l. che necessitano di accedervi per le finalità sopra indicate;</li>
                <li><strong>Responsabili del trattamento:</strong> fornitori di servizi IT, hosting, assistenza tecnica e marketing;</li>
                <li><strong>Fornitori di servizi di pagamento:</strong> PayPal, Stripe (solo per la gestione dei pagamenti);</li>
                <li><strong>Terze parti:</strong> in caso di obbligo di legge, per tutelare i diritti di In&Out S.r.l. o per la sicurezza degli utenti.</li>
              </ul>
              
              <p>
                I dati degli annunci pubblicati (indirizzo approssimativo, foto, descrizione, prezzo) sono resi visibili pubblicamente sul Sito come parte essenziale del servizio.
              </p>
              
              <h2 id="trasferimento-extra-UE">6. Trasferimento dei dati all'estero</h2>
              <p>
                Alcuni dati potrebbero essere trasferiti in paesi al di fuori dell'Unione Europea (ad es. verso i server di fornitori cloud o di servizi di pagamento). In tali casi, In&Out S.r.l. garantisce l'adozione di misure adeguate, come:
              </p>
              <ul>
                <li>Decisioni di adeguatezza della Commissione Europea;</li>
                <li>Clausole contrattuali standard approvate dalla Commissione Europea;</li>
                <li>Norme vincolanti d'impresa per i trasferimenti infragruppo;</li>
                <li>Garanzie appropriate ai sensi dell'art. 46 GDPR.</li>
              </ul>
              
              <h2 id="diritti-interessati">7. Diritti degli interessati</h2>
              <p>
                Ai sensi degli articoli da 15 a 22 del GDPR, l'utente può esercitare i seguenti diritti:
              </p>
              <ul>
                <li><strong>Diritto di accesso (art. 15):</strong> ottenere conferma dell'esistenza di un trattamento dei propri dati e accedere alle informazioni relative;</li>
                <li><strong>Diritto di rettifica (art. 16):</strong> chiedere la correzione di dati inesatti o l'integrazione di dati incompleti;</li>
                <li><strong>Diritto alla cancellazione (art. 17):</strong> chiedere la cancellazione dei propri dati personali;</li>
                <li><strong>Diritto di limitazione (art. 18):</strong> ottenere la limitazione del trattamento in determinati casi;</li>
                <li><strong>Diritto alla portabilità (art. 20):</strong> ricevere i propri dati in formato strutturato, di uso comune e leggibile da dispositivo automatico;</li>
                <li><strong>Diritto di opposizione (art. 21):</strong> opporsi al trattamento dei propri dati, in particolare per marketing e profilazione;</li>
                <li><strong>Diritto di revoca del consenso:</strong> revocare in qualsiasi momento i consensi prestati;</li>
                <li><strong>Diritto di reclamo:</strong> presentare reclamo all'autorità di controllo (in Italia, il Garante per la Protezione dei Dati Personali).</li>
              </ul>
              
              <p>
                Per esercitare i propri diritti, l'utente può contattare il Titolare del trattamento inviando una email a: <a href="mailto:privacy.ineoutroom@gmail.com" className="text-primary hover:underline">privacy.ineoutroom@gmail.com</a> o scrivendo alla sede legale indicata sopra.
              </p>
              
              <h2 id="cookie">8. Cookie e tecnologie simili</h2>
              <p>
                Il Sito utilizza cookie e tecnologie simili per diverse finalità, tra cui il funzionamento tecnico, l'analisi dell'uso del Sito e il marketing. Per informazioni dettagliate sui cookie utilizzati e per gestire le preferenze, consultare la <a href="/legal-cookies" className="text-primary hover:underline">Cookie Policy</a>.
              </p>
              
              <h2 id="minori">9. Trattamento dei dati di minori</h2>
              <p>
                I servizi offerti da In&Out Room sono riservati a persone di età superiore ai 18 anni. Non raccogliamo consapevolmente dati personali di minori. Se dovessimo venire a conoscenza di aver raccolto dati personali di un minore di 18 anni senza il consenso verificabile di un genitore o tutore, ci impegniamo a eliminarli tempestivamente.
              </p>
              
              <h2 id="modifiche">10. Modifiche all'Informativa</h2>
              <p>
                La presente Informativa può essere soggetta a modifiche per riflettere cambiamenti normativi o nelle pratiche di trattamento. In caso di modifiche sostanziali, sarà pubblicata una notifica sul Sito e, se richiesto dalla legge, sarà richiesto un nuovo consenso.
              </p>
              
              <p>
                Si consiglia di consultare regolarmente questa pagina per verificare eventuali aggiornamenti.
              </p>
              
              <h2 id="contatti">11. Contatti</h2>
              <p>
                Per qualsiasi domanda o chiarimento sulla presente Informativa o sul trattamento dei dati personali, è possibile contattare In&Out S.r.l. ai seguenti recapiti:
              </p>
              <p>
                Email: <a href="mailto:privacy.ineoutroom@gmail.com" className="text-primary hover:underline">privacy.ineoutroom@gmail.com</a><br />
                Indirizzo: Via Marcaccio 5, Tagliacozzo (AQ) – 67069, Italia
              </p>
              
              <p className="mt-8 text-sm text-muted-foreground italic">
                Data di ultima revisione della presente Informativa: 18 aprile 2025
              </p>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}