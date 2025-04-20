import SEO from '../components/SEO';
import { Navbar } from '../../client/src/components/layout/navbar';
import { Footer } from '../../client/src/components/layout/footer';

export default function PrivacyPage() {
  return (
    <>
      <SEO 
        title="Informativa Privacy ex GDPR - In&Out"
        description="Informativa sulla privacy e trattamento dei dati personali per gli utenti della piattaforma In&Out conforme al GDPR."
        keywords="privacy, dati personali, GDPR, protezione dati, informativa, trattamento dati, diritti interessato"
        canonical="/legal/privacy"
      />

      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-grow container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-6 md:p-8">
            <h1 className="text-3xl font-bold text-primary mb-6">Informativa Privacy ex GDPR</h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-muted-foreground mb-6">
                Ultimo aggiornamento: 18 Aprile 2025
              </p>
              
              <p className="lead">
                In&Out S.r.l. (di seguito "In&Out", "noi" o "nostro") si impegna a proteggere e rispettare la tua privacy. La presente Informativa spiega come raccogliamo, utilizziamo e proteggiamo i tuoi dati personali in conformità al Regolamento UE 2016/679 (GDPR) e al D.lgs. 196/2003 come modificato dal D.lgs. 101/2018.
              </p>
              
              <h2>1. Titolare del trattamento</h2>
              <p>
                Il Titolare del trattamento dei dati personali è:
              </p>
              <p>
                <strong>In&Out S.r.l.</strong><br />
                Sede legale: Via Roma 123, 20100 Milano, Italia<br />
                Partita IVA: IT12345678901<br />
                Email: <a href="mailto:privacy@inoutrooms.eu" className="text-primary hover:underline">privacy@inoutrooms.eu</a><br />
                PEC: <a href="mailto:inout@pec.it" className="text-primary hover:underline">inout@pec.it</a>
              </p>
              
              <h2>2. Finalità e base giuridica</h2>
              <p>
                Trattiamo i tuoi dati personali per le seguenti finalità e basi giuridiche:
              </p>
              <ul>
                <li>
                  <strong>Esecuzione del contratto (Art. 6.1.b GDPR):</strong> gestione dell'account, fornitura dei servizi richiesti, gestione delle pubblicazioni degli annunci, facilitazione delle comunicazioni tra utenti, gestione dei pagamenti.
                </li>
                <li>
                  <strong>Consenso (Art. 6.1.a GDPR):</strong> invio di comunicazioni di marketing, newsletter, profilazione per scopi commerciali, utilizzo di cookie non essenziali.
                </li>
                <li>
                  <strong>Legittimo interesse (Art. 6.1.f GDPR):</strong> miglioramento dei nostri servizi, analisi dell'utilizzo della piattaforma, prevenzione di frodi, sicurezza della piattaforma.
                </li>
                <li>
                  <strong>Obblighi legali (Art. 6.1.c GDPR):</strong> adempimento a obblighi fiscali, contabili e di legge.
                </li>
              </ul>
              
              <h2>3. Tipologie di dati raccolti</h2>
              <p>
                Raccogliamo e trattiamo le seguenti categorie di dati personali:
              </p>
              <ul>
                <li>
                  <strong>Dati identificativi e di contatto:</strong> nome, cognome, indirizzo email, numero di telefono, indirizzo di residenza, data di nascita.
                </li>
                <li>
                  <strong>Dati dell'account:</strong> nome utente, password (in forma criptata), preferenze dell'account.
                </li>
                <li>
                  <strong>Dati relativi alla proprietà:</strong> per gli inserzionisti, informazioni sugli immobili pubblicati.
                </li>
                <li>
                  <strong>Dati di pagamento:</strong> coordinate bancarie, informazioni sulla carta di credito (tramite fornitori di servizi di pagamento terzi).
                </li>
                <li>
                  <strong>Dati di navigazione:</strong> indirizzo IP, tipo di browser, provider di servizi internet, pagine di riferimento/uscita, file visualizzati sul sito, dati di geolocalizzazione.
                </li>
                <li>
                  <strong>Dati di utilizzo:</strong> interazioni con la piattaforma, ricerche effettuate, annunci visualizzati, messaggi scambiati con altri utenti.
                </li>
              </ul>
              
              <h2>4. Modalità di trattamento</h2>
              <p>
                I tuoi dati personali sono trattati con strumenti automatizzati e non, per il tempo strettamente necessario a conseguire gli scopi per cui sono stati raccolti. Adottiamo misure di sicurezza tecniche e organizzative adeguate per proteggere i tuoi dati da accesso, divulgazione, alterazione o distruzione non autorizzati.
              </p>
              <p>
                Il trattamento dei dati avviene presso le sedi operative di In&Out e in tutti gli altri luoghi in cui le parti coinvolte nel trattamento siano localizzate. I dati personali sono trattati dal personale di In&Out, adeguatamente istruito sul trattamento sicuro dei dati e vincolato alla riservatezza.
              </p>
              
              <h2>5. Periodo di conservazione</h2>
              <p>
                Conserviamo i tuoi dati personali per il tempo necessario a conseguire le finalità per cui sono stati raccolti, o per soddisfare requisiti legali o regolamentari. In particolare:
              </p>
              <ul>
                <li>Dati dell'account: fino alla cancellazione dell'account e per ulteriori 12 mesi per finalità di sicurezza e per rispondere a eventuali richieste legali.</li>
                <li>Dati relativi alle transazioni: per 10 anni, in conformità agli obblighi fiscali e contabili.</li>
                <li>Dati di comunicazione tra utenti: fino a 24 mesi dalla conclusione della comunicazione.</li>
                <li>Dati per finalità di marketing: fino alla revoca del consenso o per un massimo di 24 mesi dall'ultima interazione.</li>
              </ul>
              <p>
                Al termine del periodo di conservazione, i dati personali saranno cancellati o resi anonimi.
              </p>
              
              <h2>6. Diritti dell'interessato</h2>
              <p>
                In qualità di interessato, ai sensi degli articoli da 15 a 22 del GDPR, hai il diritto di:
              </p>
              <ul>
                <li><strong>Accesso (Art. 15):</strong> ottenere conferma del trattamento dei tuoi dati e accedere al loro contenuto.</li>
                <li><strong>Rettifica (Art. 16):</strong> aggiornare, modificare e/o correggere i tuoi dati personali.</li>
                <li><strong>Cancellazione (Art. 17):</strong> chiedere la cancellazione dei tuoi dati (diritto all'oblio).</li>
                <li><strong>Limitazione (Art. 18):</strong> limitare il trattamento dei tuoi dati.</li>
                <li><strong>Opposizione (Art. 21):</strong> opporti al trattamento per finalità di marketing o per motivi legati alla tua situazione particolare.</li>
                <li><strong>Portabilità (Art. 20):</strong> ricevere in formato strutturato i dati forniti e trasmetterli a un altro titolare.</li>
                <li><strong>Revoca del consenso (Art. 7):</strong> revocare il consenso prestato per finalità specifiche.</li>
                <li><strong>Reclamo (Art. 77):</strong> presentare reclamo all'Autorità Garante per la Protezione dei Dati Personali.</li>
              </ul>
              <p>
                Per esercitare i tuoi diritti o per qualsiasi informazione relativa al trattamento dei tuoi dati personali, puoi contattare il Titolare all'indirizzo email <a href="mailto:privacy@inoutrooms.eu" className="text-primary hover:underline">privacy@inoutrooms.eu</a>.
              </p>
              
              <h2>7. Destinatari e trasferimenti internazionali</h2>
              <p>
                I tuoi dati personali possono essere condivisi con le seguenti categorie di destinatari:
              </p>
              <ul>
                <li>Dipendenti e collaboratori di In&Out, in qualità di persone autorizzate al trattamento.</li>
                <li>Fornitori di servizi tecnici (hosting, manutenzione, sviluppo software) che agiscono come responsabili del trattamento.</li>
                <li>Fornitori di servizi di pagamento per l'elaborazione delle transazioni.</li>
                <li>Consulenti legali, fiscali e contabili di In&Out.</li>
                <li>Autorità pubbliche, quando richiesto dalla legge.</li>
                <li>Altri utenti della piattaforma, limitatamente ai dati necessari per l'interazione sulla piattaforma.</li>
              </ul>
              <p>
                Alcuni dei nostri fornitori di servizi possono essere situati al di fuori dell'Unione Europea. In tali casi, assicuriamo che il trasferimento dei dati avvenga in conformità alla normativa applicabile, tramite decisioni di adeguatezza, clausole contrattuali standard o altre garanzie appropriate.
              </p>
              
              <h2>8. Dati di navigazione e cookie</h2>
              <p>
                Il nostro sito utilizza cookie e tecnologie simili per migliorare la tua esperienza di navigazione, analizzare il traffico e personalizzare i contenuti. I cookie sono piccoli file di testo che vengono memorizzati sul tuo dispositivo quando visiti il nostro sito.
              </p>
              <p>
                Per informazioni dettagliate sui cookie utilizzati e su come gestirli, consulta la nostra <a href="/legal/cookies" className="text-primary hover:underline">Cookie Policy</a>.
              </p>
              
              <h2>9. Contatti del Data Protection Officer (DPO)</h2>
              <p>
                Il nostro Responsabile della Protezione dei Dati (DPO) può essere contattato ai seguenti recapiti:
              </p>
              <p>
                Email: <a href="mailto:dpo@inoutrooms.eu" className="text-primary hover:underline">dpo@inoutrooms.eu</a><br />
                Indirizzo: DPO In&Out S.r.l., Via Roma 123, 20100 Milano, Italia
              </p>
              
              <h2>10. Modifiche all'Informativa</h2>
              <p>
                Ci riserviamo il diritto di modificare o aggiornare questa Informativa in qualsiasi momento. La versione più recente sarà sempre disponibile sul nostro sito web. In caso di modifiche significative, ti informeremo tramite email o un avviso sulla nostra piattaforma.
              </p>
              <p>
                Ti invitiamo a consultare regolarmente questa Informativa per essere aggiornato sulle nostre pratiche in materia di protezione dei dati personali.
              </p>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}