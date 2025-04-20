import SEO from './components/SEO';
import { Navbar } from '../client/src/components/layout/navbar';
import { Footer } from '../client/src/components/layout/footer';

export default function TermsPage() {
  return (
    <>
      <SEO 
        title="Termini e Condizioni di Utilizzo - In&Out"
        description="Termini e condizioni per l'utilizzo della piattaforma In&Out per la ricerca di stanze e alloggi in Europa."
        keywords="termini, condizioni, utilizzo, legali, regolamento, In&Out, contratto"
        canonical="/terms"
      />

      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-grow container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-6 md:p-8">
            <h1 className="text-3xl font-bold text-primary mb-6">Termini e Condizioni di Utilizzo</h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-muted-foreground mb-6">
                Ultimo aggiornamento: 18 aprile 2025
              </p>
              
              <p>
                Le presenti Condizioni Generali di Contratto (di seguito, i "Termini") disciplinano l'accesso e l'uso del sito web In&Out (https://ineoutroom.eu, di seguito il "Sito") e dei servizi ad esso collegati (di seguito, i "Servizi"), offerti da:
              </p>
              
              <p className="pl-4 border-l-4 border-primary">
                In&Out S.r.l.<br />
                Sede legale: Via Marcaccio 5, Tagliacozzo (AQ) – 67069<br />
                P. IVA: IT02167900667<br />
                N. REA: AQ‑210467
              </p>
              
              <p>
                L'accesso al Sito e l'utilizzo dei Servizi implicano l'accettazione integrale e senza riserve dei presenti Termini. Qualora l'Utente non intenda essere vincolato da uno qualsiasi dei Termini, è tenuto a interrompere immediatamente qualsiasi attività di navigazione o utilizzo del Sito.
              </p>
              
              <h2>1. Definizioni</h2>
              <p>
                <strong>Utente:</strong> qualsiasi persona fisica o giuridica che accede al Sito, si registra o utilizza i Servizi.<br />
                <strong>Account:</strong> credenziali che consentono l'accesso personalizzato al Sito.<br />
                <strong>Annuncio:</strong> contenuto digitale creato dall'Utente relativo a stanze singole, stanze doppie, monolocali, bilocali o appartamenti uso studio.<br />
                <strong>Contenuti Utente:</strong> testi, immagini, video e altro materiale caricato dall'Utente.<br />
                <strong>Piano di Pubblicazione:</strong> pacchetto di pubblicazione a pagamento che consente la pubblicazione di un numero definito di Annunci.
              </p>
              
              <h2>2. Oggetto e Finalità</h2>
              <p>
                In&Out fornisce una piattaforma online di vetrina per annunci di locazione, permettendo a privati e agenzie di pubblicare e a chi cerca di consultare offerte. In&Out non interviene nelle trattative, non verifica la veridicità degli Annunci e non assume responsabilità contrattuale tra le parti.
              </p>
              
              <h2>3. Registrazione e Account</h2>
              <p>
                <strong>Requisiti:</strong> possono registrarsi utenti maggiorenni.<br /><br />
                <strong>Procedura:</strong> l'Utente fornisce email valida e password; conferma il consenso al trattamento dei dati personali (GDPR).<br /><br />
                <strong>Verifica:</strong> l'attivazione avviene tramite link inviato via email.<br /><br />
                <strong>Sicurezza:</strong> l'Utente è responsabile della custodia delle credenziali e delle attività eseguite con il proprio Account.
              </p>
              
              <h2>4. Pubblicazione e Gestione degli Annunci</h2>
              <p>
                <strong>Tipologie Ammesse:</strong> stanze singole, stanze doppie, monolocali, bilocali, appartamenti uso studio. Sono vietati immobili di lusso o destinazioni turistiche stagionali.<br /><br />
                <strong>Contenuto e Veridicità:</strong> l'Utente garantisce l'accuratezza dei dati (indirizzo, prezzo, foto, descrizione).<br /><br />
                <strong>Moderazione:</strong> In&Out può rimuovere gli Annunci in caso di violazione di legge, diritti di terzi o di questi Termini.<br /><br />
                <strong>Responsabilità:</strong> In&Out non verifica preventivamente le informazioni; l'Utente è unico responsabile di eventuali controversie o danni.
              </p>
              
              <h2>5. Piani di Pubblicazione e Pagamenti</h2>
              <p>
                <strong>Prima Inserzione:</strong> gratuita per ogni nuovo Utente.<br /><br />
                <strong>Piani Successivi:</strong> obbligatorio sottoscrivere un Piano di Pubblicazione (es. "5 inserzioni a € 0,99") dalla seconda inserzione in poi.<br /><br />
                <strong>Modalità di Pagamento:</strong> PayPal e Stripe, gestiti da terzi; In&Out non detiene dati di pagamento.<br /><br />
                <strong>Rimborso:</strong> non sono previsti rimborsi per Piani non completamente utilizzati, salvo obblighi di legge sul recesso (D.Lgs. 206/2005).
              </p>
              
              <h2>6. Proprietà Intellettuale</h2>
              <p>
                <strong>Diritti In&Out:</strong> il sito, la grafica, il codice e i marchi sono di proprietà di In&Out o dei rispettivi licenzianti.<br /><br />
                <strong>Diritti Utente:</strong> l'Utente conserva la paternità sui Contenuti Utente e concede a In&Out licenza non esclusiva e gratuita per pubblicare e distribuire tali contenuti nell'ambito dei Servizi.<br /><br />
                <strong>Divieti:</strong> è vietata ogni riproduzione o sfruttamento commerciale non autorizzato.
              </p>
              
              <h2>7. Trattamento dei Dati Personali</h2>
              <p>
                La Gestione dei dati personali è disciplinata dalla Privacy Policy (art. 13 GDPR) disponibile su <a href="/legal-privacy" className="text-primary hover:underline">https://ineoutroom.eu/legal-privacy</a>. L'Utente può esercitare i diritti di accesso, rettifica, cancellazione, opposizione e portabilità ai sensi degli artt. 15–22 GDPR.
              </p>
              
              <h2>8. Cookie</h2>
              <p>
                L'uso dei cookie è regolato dalla Cookie Policy (Provvedimento Garante Privacy 8 maggio 2014), disponibile su <a href="/legal-cookies" className="text-primary hover:underline">https://ineoutroom.eu/legal-cookies</a>. L'Utente può gestire il proprio consenso tramite banner e impostazioni browser.
              </p>
              
              <h2>9. Esonero e Limitazione di Responsabilità</h2>
              <p>
                <strong>"AS IS":</strong> i Servizi sono forniti "così come sono" senza garanzie di alcun tipo.<br /><br />
                <strong>Uso a Rischio:</strong> l'accesso e l'utilizzo del Sito avviene a rischio dell'Utente.<br /><br />
                <strong>Nessuna Responsabilità:</strong> In&Out non risponde per danni diretti, indiretti, consequenziali o punitivi derivanti dall'uso del Sito o da transazioni tra Utenti.<br /><br />
                <strong>Forza Maggiore:</strong> In&Out non è responsabile per eventi imprevedibili o esterni che impediscano la fornitura del Servizio.
              </p>
              
              <h2>10. Modifiche ai Termini</h2>
              <p>
                In&Out può modificare i presenti Termini in qualsiasi momento. Le variazioni saranno efficaci alla pubblicazione sul Sito. L'uso continuato dopo la pubblicazione costituisce accettazione delle modifiche.
              </p>
              
              <h2>11. Durata e Risoluzione</h2>
              <p>
                <strong>Durata:</strong> i Termini rimangono in vigore fino a eventuale modifica o cessazione del Sito.<br /><br />
                <strong>Sospensione Account:</strong> In&Out può sospendere o chiudere l'Account in caso di violazione dei Termini, fatto salvo il risarcimento dei danni subiti.
              </p>
              
              <h2>12. Legge Applicabile e Foro Competente</h2>
              <p>
                I presenti Termini sono regolati dalla legge italiana. Qualsiasi controversia sarà devoluta alla competenza esclusiva del Foro di L'Aquila, fermo restando il diritto dell'Utente di adire il foro del proprio domicilio se previsto da norme imperative.
              </p>
              
              <h2>13. Contatti</h2>
              <p>
                Per richieste di supporto o chiarimenti:<br />
                Email: <a href="mailto:info.ineoutroom@gmail.com" className="text-primary hover:underline">info.ineoutroom@gmail.com</a><br />
                Sito: <a href="https://ineoutroom.eu" className="text-primary hover:underline">https://ineoutroom.eu</a>
              </p>
              
              <h2 id="informazioni-legali">Informazioni Legali</h2>
              <p>
                Di seguito sono riportate le informazioni legali relative alla società che gestisce la piattaforma In&Out.
              </p>
              
              <h3>Ragione sociale e forma giuridica</h3>
              <p>
                In&Out S.r.l.<br />
                Società a responsabilità limitata di diritto italiano<br />
                Capitale sociale: € 10.000,00 interamente versato
              </p>
              
              <h3>Sede legale</h3>
              <p>
                Via Marcaccio 5<br />
                Tagliacozzo (AQ) – 67069<br />
                Italia
              </p>
              
              <h3>Partita IVA e REA</h3>
              <p>
                <strong>P. IVA:</strong> IT02167900667<br />
                <strong>N. REA:</strong> AQ‑210467
              </p>
              
              <p className="mt-8 text-sm text-muted-foreground italic">
                Grazie per aver scelto In&Out. Ci impegniamo a offrire un servizio trasparente e conforme alla normativa.
              </p>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}