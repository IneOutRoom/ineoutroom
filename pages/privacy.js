import SEO from './components/SEO';
import { Navbar } from '../client/src/components/layout/navbar';
import { Footer } from '../client/src/components/layout/footer';

export default function PrivacyPage() {
  return (
    <>
      <SEO 
        title="Informativa sulla Privacy - In&Out"
        description="Informativa sulla privacy e trattamento dei dati personali per gli utenti della piattaforma In&Out."
        keywords="privacy, dati personali, GDPR, protezione dati, informativa, cookie"
        canonical="/privacy"
      />

      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-grow container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-6 md:p-8">
            <h1 className="text-3xl font-bold text-primary mb-6">Informativa sulla Privacy</h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-muted-foreground mb-6">
                Ultimo aggiornamento: 18 Aprile 2025
              </p>
              
              <p className="lead">
                In&Out si impegna a proteggere la tua privacy e i tuoi dati personali. Questa Informativa sulla Privacy spiega come raccogliamo, utilizziamo, condividiamo e proteggiamo le informazioni personali degli utenti della nostra piattaforma per la ricerca di stanze e alloggi in Europa.
              </p>
              
              <h2>1. Informazioni che Raccogliamo</h2>
              <p>
                Raccogliamo le seguenti tipologie di informazioni:
              </p>
              <ul>
                <li>
                  <strong>Informazioni dell'account:</strong> nome, cognome, indirizzo email, password, numero di telefono, foto del profilo.
                </li>
                <li>
                  <strong>Informazioni di contatto:</strong> indirizzo, città, paese, codice postale.
                </li>
                <li>
                  <strong>Informazioni di pagamento:</strong> dettagli della carta di credito o altre informazioni finanziarie (elaborati tramite i nostri partner di pagamento).
                </li>
                <li>
                  <strong>Informazioni sulla proprietà:</strong> posizione, dimensioni, prezzo, caratteristiche, foto e altre informazioni relative agli alloggi pubblicati.
                </li>
                <li>
                  <strong>Dati di utilizzo:</strong> informazioni su come interagisci con la nostra piattaforma, inclusi indirizzi IP, dispositivi utilizzati, pagine visitate, azioni eseguite.
                </li>
                <li>
                  <strong>Comunicazioni:</strong> messaggi scambiati tra utenti tramite la nostra piattaforma.
                </li>
              </ul>
              
              <h2>2. Come Utilizziamo le Informazioni</h2>
              <p>
                Utilizziamo le informazioni raccolte per:
              </p>
              <ul>
                <li>Fornire, mantenere e migliorare la nostra piattaforma</li>
                <li>Processare transazioni e gestire gli abbonamenti</li>
                <li>Facilitare la comunicazione tra utenti</li>
                <li>Personalizzare l'esperienza utente e fornire contenuti e annunci pertinenti</li>
                <li>Analizzare l'utilizzo della piattaforma per migliorare i nostri servizi</li>
                <li>Proteggere la sicurezza e l'integrità della piattaforma</li>
                <li>Rispettare obblighi legali e normativi</li>
              </ul>
              
              <h2>3. Condivisione delle Informazioni</h2>
              <p>
                Possiamo condividere le tue informazioni con:
              </p>
              <ul>
                <li>
                  <strong>Altri utenti:</strong> quando pubblichi un annuncio o contatti un inserzionista, alcune tue informazioni sono visibili ad altri utenti.
                </li>
                <li>
                  <strong>Fornitori di servizi:</strong> collaboriamo con terze parti che ci aiutano a gestire la piattaforma (elaborazione pagamenti, storage cloud, analisi, ecc.).
                </li>
                <li>
                  <strong>Partner commerciali:</strong> possiamo condividere informazioni con partner selezionati per offrirti servizi complementari.
                </li>
                <li>
                  <strong>Autorità legali:</strong> quando obbligati dalla legge o in risposta a richieste legali valide.
                </li>
              </ul>
              
              <h2>4. Cookie e Tecnologie Simili</h2>
              <p>
                Utilizziamo cookie e tecnologie simili per raccogliere informazioni sull'utilizzo della piattaforma, personalizzare l'esperienza utente e mostrare annunci pertinenti. Puoi gestire le preferenze sui cookie attraverso le impostazioni del tuo browser. Per maggiori dettagli, consulta la nostra <a href="/cookie-policy" className="text-primary hover:underline">Cookie Policy</a>.
              </p>
              
              <h2>5. Sicurezza dei Dati</h2>
              <p>
                Implementiamo misure di sicurezza appropriate per proteggere le tue informazioni personali, incluse la crittografia, l'accesso limitato e regolari valutazioni della sicurezza. Tuttavia, nessun sistema è completamente sicuro, e non possiamo garantire la sicurezza assoluta delle tue informazioni.
              </p>
              
              <h2>6. I Tuoi Diritti sulla Privacy</h2>
              <p>
                In conformità con il GDPR e altre leggi applicabili, hai diritto a:
              </p>
              <ul>
                <li>Accedere alle tue informazioni personali</li>
                <li>Correggere informazioni inesatte</li>
                <li>Eliminare le tue informazioni (in determinate circostanze)</li>
                <li>Limitare o opporti al trattamento dei tuoi dati</li>
                <li>Portabilità dei dati</li>
                <li>Revocare il consenso</li>
              </ul>
              <p>
                Per esercitare questi diritti, contattaci all'indirizzo <a href="mailto:privacy@ineoutroom.eu" className="text-primary hover:underline">privacy@ineoutroom.eu</a>.
              </p>
              
              <h2>7. Conservazione dei Dati</h2>
              <p>
                Conserviamo i tuoi dati personali per il tempo necessario a fornire i nostri servizi, rispettare gli obblighi legali o proteggere i nostri interessi legittimi. Quando i tuoi dati non sono più necessari, li eliminiamo o li rendiamo anonimi.
              </p>
              
              <h2>8. Trasferimenti Internazionali di Dati</h2>
              <p>
                Poiché operiamo a livello europeo, i tuoi dati possono essere trasferiti e archiviati in paesi diversi dal tuo. Assicuriamo adeguate misure di salvaguardia per proteggere i tuoi dati in conformità con le leggi sulla protezione dei dati applicabili.
              </p>
              
              <h2>9. Modifiche a questa Informativa</h2>
              <p>
                Possiamo aggiornare questa Informativa sulla Privacy di tanto in tanto. Ti informeremo di eventuali modifiche sostanziali pubblicando la nuova Informativa sulla nostra piattaforma e, se necessario, ti avviseremo tramite email.
              </p>
              
              <h2>10. Contattaci</h2>
              <p>
                Per qualsiasi domanda o preoccupazione riguardo questa Informativa o le tue informazioni personali, contattaci all'indirizzo: <a href="mailto:privacy@ineoutroom.eu" className="text-primary hover:underline">privacy@ineoutroom.eu</a>
              </p>
              
              <p>
                <strong>Titolare del Trattamento:</strong><br />
                In&Out S.r.l.<br />
                Via Roma 123<br />
                20100 Milano, Italia
              </p>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}