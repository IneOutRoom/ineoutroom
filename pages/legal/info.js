import SEO from '../components/SEO';
import { Navbar } from '../../client/src/components/layout/navbar';
import { Footer } from '../../client/src/components/layout/footer';

export default function InfoPage() {
  return (
    <>
      <SEO 
        title="Informazioni Legali - In&Out"
        description="Informazioni legali, dati aziendali e disclaimer per gli utenti della piattaforma In&Out."
        keywords="informazioni legali, dati aziendali, disclaimer, partita IVA, codice fiscale, sede legale, PEC"
        canonical="/legal/info"
      />

      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-grow container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-6 md:p-8">
            <h1 className="text-3xl font-bold text-primary mb-6">Informazioni Legali</h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-muted-foreground mb-6">
                Ultimo aggiornamento: 18 Aprile 2025
              </p>
              
              <p className="lead">
                Questa pagina contiene tutte le informazioni legali relative alla società che gestisce la piattaforma In&Out, un servizio online dedicato alla ricerca di stanze e alloggi in Europa.
              </p>
              
              <h2>1. Ragione sociale e forma giuridica</h2>
              <p>
                In&Out S.r.l.<br />
                Società a responsabilità limitata di diritto italiano
              </p>
              <p>
                Capitale sociale: € 10.000,00 interamente versato
              </p>
              
              <h2>2. Sede legale e operativa</h2>
              <p>
                <strong>Sede legale:</strong><br />
                Via Roma 123<br />
                20100 Milano (MI)<br />
                Italia
              </p>
              <p>
                <strong>Sede operativa:</strong><br />
                Viale Europa 45<br />
                20100 Milano (MI)<br />
                Italia
              </p>
              
              <h2>3. Partita IVA e Codice Fiscale</h2>
              <div className="not-prose bg-gray-100 p-4 rounded-md mb-6">
                <p><strong>Partita IVA:</strong> IT12345678901</p>
                <p><strong>Codice Fiscale:</strong> 12345678901</p>
              </div>
              
              <h2>4. REA e numero CCIAA</h2>
              <div className="not-prose bg-gray-100 p-4 rounded-md mb-6">
                <p><strong>Numero REA:</strong> MI - 1234567</p>
                <p><strong>Registro delle Imprese di Milano:</strong> 12345678901</p>
              </div>
              
              <h2>5. PEC e contatti</h2>
              <div className="not-prose bg-gray-100 p-4 rounded-md mb-6 space-y-2">
                <p><strong>PEC:</strong> <a href="mailto:inout@pec.it" className="text-primary hover:underline">inout@pec.it</a></p>
                <p><strong>Email:</strong> <a href="mailto:info@inoutrooms.eu" className="text-primary hover:underline">info@inoutrooms.eu</a></p>
                <p><strong>Telefono:</strong> +39 02 1234567</p>
                <p><strong>Sito web:</strong> <a href="https://www.inoutrooms.eu" className="text-primary hover:underline">www.inoutrooms.eu</a></p>
              </div>
              
              <h2>6. Disclaimer</h2>
              <div className="not-prose border-l-4 border-yellow-500 pl-4 py-2 mb-6">
                <p className="font-medium">
                  In&Out è un servizio di intermediazione online che agisce esclusivamente come aggregatore di annunci immobiliari. La piattaforma non è responsabile della veridicità, accuratezza, completezza o legittimità dei contenuti pubblicati dagli utenti.
                </p>
              </div>
              <p>
                La piattaforma In&Out:
              </p>
              <ul>
                <li>Non è un'agenzia immobiliare e non fornisce servizi di mediazione immobiliare ai sensi della legge italiana;</li>
                <li>Non verifica l'identità degli utenti, le informazioni personali o i dettagli delle proprietà, se non nei limiti espressamente indicati nei Termini e Condizioni;</li>
                <li>Non è parte dei contratti di locazione o di qualsiasi altro accordo tra gli utenti;</li>
                <li>Non garantisce la disponibilità, qualità, sicurezza o legalità delle proprietà pubblicizzate;</li>
                <li>Non è responsabile per eventuali danni, perdite o controversie derivanti dall'utilizzo della piattaforma o dalle interazioni tra gli utenti;</li>
                <li>Si riserva il diritto di rimuovere contenuti che violino i Termini e Condizioni o la legge applicabile, ma non ha l'obbligo di monitorare attivamente tutti i contenuti pubblicati.</li>
              </ul>
              <p>
                Gli utenti sono invitati a:
              </p>
              <ul>
                <li>Verificare personalmente le informazioni relative alle proprietà e agli altri utenti;</li>
                <li>Adottare le necessarie precauzioni prima di effettuare pagamenti o stipulare contratti;</li>
                <li>Segnalare contenuti inappropriati, fraudolenti o illegali attraverso i canali messi a disposizione dalla piattaforma.</li>
              </ul>
              
              <h2>7. Diritti di proprietà intellettuale</h2>
              <p>
                Tutti i contenuti presenti sulla piattaforma In&Out, inclusi, a titolo esemplificativo ma non esaustivo, loghi, marchi, testi, grafica, immagini, video, software e codice sorgente, sono protetti dalle leggi sul copyright e sulla proprietà intellettuale e sono di proprietà di In&Out S.r.l. o dei suoi licenzianti.
              </p>
              <p>
                È vietata la riproduzione, distribuzione, modifica o utilizzo di tali contenuti senza il previo consenso scritto di In&Out S.r.l., fatta eccezione per gli usi consentiti dalla legge.
              </p>
              
              <h2>8. Legge applicabile</h2>
              <p>
                Le attività di In&Out S.r.l. sono regolate dalla legge italiana e dell'Unione Europea. Ogni controversia relativa all'utilizzo della piattaforma sarà soggetta alla giurisdizione esclusiva del Foro di Milano, fatta salva l'applicazione di norme inderogabili che prevedano fori alternativi.
              </p>
              
              <h2>9. Aggiornamenti</h2>
              <p>
                Le informazioni contenute in questa pagina possono essere soggette a modifiche. Gli utenti sono invitati a consultare periodicamente questa pagina per verificare eventuali aggiornamenti.
              </p>
              <p>
                La data in alto a questa pagina indica l'ultimo aggiornamento delle informazioni legali.
              </p>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}