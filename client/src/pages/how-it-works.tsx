import React from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import { 
  Search, 
  Building, 
  MessageCircle, 
  CreditCard, 
  Star, 
  Shield, 
  Bell, 
  Users, 
  FileText, 
  Sparkles 
} from "lucide-react";

export default function HowItWorks() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-[#6a0dad]/90 to-[#6a0dad]/70 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6" style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.3)" }}>
                Come funziona In&Out
              </h1>
              <p className="text-xl mb-8 max-w-2xl opacity-90">
                Trova facilmente il tuo alloggio ideale o affitta le tue proprietà in pochi semplici passaggi
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/search">
                  <Button 
                    size="lg" 
                    className="bg-white text-[#6a0dad] hover:bg-[#ffcb05] hover:text-[#333] shadow-lg transition-all transform hover:scale-105"
                  >
                    <Search className="mr-2 h-5 w-5" />
                    Cerca alloggi
                  </Button>
                </Link>
                <Link href="/properties/new">
                  <Button 
                    size="lg" 
                    className="bg-[#ffcb05] text-[#333] hover:bg-white hover:text-[#6a0dad] shadow-lg transition-all transform hover:scale-105"
                  >
                    <Building className="mr-2 h-5 w-5" />
                    Pubblica annuncio
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        {/* Steps Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#6a0dad] to-[#6a0dad]/70">
                Come utilizzare In&Out
              </span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Per chi cerca casa */}
              <Card className="border-[#6a0dad]/10 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-[#6a0dad]/10 to-transparent pb-3">
                  <CardTitle className="flex items-center text-xl font-bold">
                    <Search className="h-6 w-6 mr-2 text-[#6a0dad]" />
                    Per chi cerca casa
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <ol className="space-y-4 list-decimal list-inside text-neutral-700">
                    <li className="pb-3 border-b border-neutral-100">
                      <strong className="text-[#6a0dad]">Registrati</strong> e crea il tuo profilo con le tue preferenze
                    </li>
                    <li className="pb-3 border-b border-neutral-100">
                      <strong className="text-[#6a0dad]">Cerca</strong> tra gli annunci utilizzando filtri avanzati
                    </li>
                    <li className="pb-3 border-b border-neutral-100">
                      <strong className="text-[#6a0dad]">Contatta</strong> direttamente i proprietari tramite la chat
                    </li>
                    <li className="pb-3 border-b border-neutral-100">
                      <strong className="text-[#6a0dad]">Visita</strong> le proprietà che ti interessano
                    </li>
                    <li>
                      <strong className="text-[#6a0dad]">Gestisci</strong> i documenti e completa il contratto
                    </li>
                  </ol>
                  
                  <Link href="/search">
                    <Button className="w-full mt-6 bg-[#6a0dad] hover:bg-[#6a0dad]/80">
                      Inizia la ricerca
                    </Button>
                  </Link>
                </CardContent>
              </Card>
              
              {/* Per i proprietari */}
              <Card className="border-[#6a0dad]/10 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-[#6a0dad]/10 to-transparent pb-3">
                  <CardTitle className="flex items-center text-xl font-bold">
                    <Building className="h-6 w-6 mr-2 text-[#6a0dad]" />
                    Per i proprietari
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <ol className="space-y-4 list-decimal list-inside text-neutral-700">
                    <li className="pb-3 border-b border-neutral-100">
                      <strong className="text-[#6a0dad]">Registrati</strong> e crea il tuo profilo di proprietario
                    </li>
                    <li className="pb-3 border-b border-neutral-100">
                      <strong className="text-[#6a0dad]">Attiva</strong> un abbonamento o acquista un singolo annuncio
                    </li>
                    <li className="pb-3 border-b border-neutral-100">
                      <strong className="text-[#6a0dad]">Pubblica</strong> i tuoi annunci con foto e descrizioni dettagliate
                    </li>
                    <li className="pb-3 border-b border-neutral-100">
                      <strong className="text-[#6a0dad]">Gestisci</strong> le richieste e comunica con gli interessati
                    </li>
                    <li>
                      <strong className="text-[#6a0dad]">Finalizza</strong> i contratti e organizza la consegna
                    </li>
                  </ol>
                  
                  <Link href="/properties/new">
                    <Button className="w-full mt-6 bg-[#6a0dad] hover:bg-[#6a0dad]/80">
                      Pubblica annuncio
                    </Button>
                  </Link>
                </CardContent>
              </Card>
              
              {/* Servizi aggiuntivi */}
              <Card className="border-[#6a0dad]/10 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-[#6a0dad]/10 to-transparent pb-3">
                  <CardTitle className="flex items-center text-xl font-bold">
                    <Sparkles className="h-6 w-6 mr-2 text-[#6a0dad]" />
                    Servizi aggiuntivi
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <ul className="space-y-4 text-neutral-700">
                    <li className="pb-3 border-b border-neutral-100 flex items-center">
                      <MessageCircle className="h-5 w-5 mr-2 text-[#6a0dad]" />
                      <span><strong className="text-[#6a0dad]">Chat in tempo reale</strong> tra inquilini e proprietari</span>
                    </li>
                    <li className="pb-3 border-b border-neutral-100 flex items-center">
                      <Bell className="h-5 w-5 mr-2 text-[#6a0dad]" />
                      <span><strong className="text-[#6a0dad]">Notifiche</strong> per nuovi annunci e messaggi</span>
                    </li>
                    <li className="pb-3 border-b border-neutral-100 flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-[#6a0dad]" />
                      <span><strong className="text-[#6a0dad]">Gestione documenti</strong> con firma elettronica</span>
                    </li>
                    <li className="pb-3 border-b border-neutral-100 flex items-center">
                      <Star className="h-5 w-5 mr-2 text-[#6a0dad]" />
                      <span><strong className="text-[#6a0dad]">Recensioni verificate</strong> di proprietà e proprietari</span>
                    </li>
                    <li className="flex items-center">
                      <Shield className="h-5 w-5 mr-2 text-[#6a0dad]" />
                      <span><strong className="text-[#6a0dad]">Assistenza</strong> durante tutto il processo</span>
                    </li>
                  </ul>
                  
                  <Link href="/subscription-plans">
                    <Button className="w-full mt-6 bg-[#6a0dad] hover:bg-[#6a0dad]/80">
                      Scopri i piani
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 bg-neutral-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#6a0dad] to-[#6a0dad]/70">
                Perché scegliere In&Out
              </span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-all transform hover:scale-105">
                <div className="bg-[#6a0dad]/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Search className="h-8 w-8 text-[#6a0dad]" />
                </div>
                <h3 className="text-lg font-bold mb-2">Ricerca Intelligente</h3>
                <p className="text-neutral-600">Filtra per zona, budget, caratteristiche e trova esattamente ciò che cerchi</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-all transform hover:scale-105">
                <div className="bg-[#6a0dad]/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <MessageCircle className="h-8 w-8 text-[#6a0dad]" />
                </div>
                <h3 className="text-lg font-bold mb-2">Comunicazione Diretta</h3>
                <p className="text-neutral-600">Chat in tempo reale per rispondere a domande e organizzare visite velocemente</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-all transform hover:scale-105">
                <div className="bg-[#6a0dad]/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <CreditCard className="h-8 w-8 text-[#6a0dad]" />
                </div>
                <h3 className="text-lg font-bold mb-2">Pagamenti Sicuri</h3>
                <p className="text-neutral-600">Gestisci depositi e affitti tramite il nostro sistema di pagamento protetto</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-all transform hover:scale-105">
                <div className="bg-[#6a0dad]/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-8 w-8 text-[#6a0dad]" />
                </div>
                <h3 className="text-lg font-bold mb-2">Community Affidabile</h3>
                <p className="text-neutral-600">Profili verificati e sistema di recensioni per garantire sicurezza e trasparenza</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* FAQ Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#6a0dad] to-[#6a0dad]/70">
                Domande frequenti
              </span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-8">
                {/* FAQ 1 */}
                <div className="bg-neutral-50 rounded-lg p-6 shadow-md hover:shadow-lg transition-all">
                  <h3 className="text-xl font-bold mb-3 text-[#6a0dad]">
                    Come posso pubblicare il mio annuncio?
                  </h3>
                  <p className="text-neutral-700">
                    Registrati, effettua l'accesso e scegli un piano di abbonamento o l'opzione singolo annuncio. 
                    Utilizza il form di inserimento per aggiungere tutte le informazioni sulla tua proprietà, 
                    carica foto di qualità e pubblica. Il tuo annuncio sarà visibile immediatamente!
                  </p>
                </div>
                
                {/* FAQ 2 */}
                <div className="bg-neutral-50 rounded-lg p-6 shadow-md hover:shadow-lg transition-all">
                  <h3 className="text-xl font-bold mb-3 text-[#6a0dad]">
                    Quali piani di abbonamento offrite?
                  </h3>
                  <p className="text-neutral-700">
                    Offriamo tre opzioni: Singolo (0,99€ per annuncio), Standard (5,99€/mese per 30 annunci) 
                    e Premium (9,99€/mese per annunci illimitati). Tutti i piani includono l'assistenza 
                    e l'accesso alle funzionalità di base, mentre i piani Standard e Premium offrono 
                    funzionalità aggiuntive come la priorità nelle ricerche.
                  </p>
                </div>
                
                {/* FAQ 3 */}
                <div className="bg-neutral-50 rounded-lg p-6 shadow-md hover:shadow-lg transition-all">
                  <h3 className="text-xl font-bold mb-3 text-[#6a0dad]">
                    Come funziona il sistema di messaggistica?
                  </h3>
                  <p className="text-neutral-700">
                    La nostra chat integrata ti permette di comunicare direttamente con proprietari o inquilini 
                    interessati. Riceverai notifiche via email e all'interno della piattaforma per ogni nuovo 
                    messaggio. Le conversazioni vengono conservate per riferimento futuro.
                  </p>
                </div>
              </div>
              
              <div className="space-y-8">
                {/* FAQ 4 */}
                <div className="bg-neutral-50 rounded-lg p-6 shadow-md hover:shadow-lg transition-all">
                  <h3 className="text-xl font-bold mb-3 text-[#6a0dad]">
                    Come vengono verificati gli utenti?
                  </h3>
                  <p className="text-neutral-700">
                    Utilizziamo un sistema di verifica multi-livello che include email, numero di telefono 
                    e, per i proprietari, documenti di identità. Il sistema di recensioni permette inoltre 
                    agli utenti di valutare la loro esperienza, contribuendo a creare una community affidabile.
                  </p>
                </div>
                
                {/* FAQ 5 */}
                <div className="bg-neutral-50 rounded-lg p-6 shadow-md hover:shadow-lg transition-all">
                  <h3 className="text-xl font-bold mb-3 text-[#6a0dad]">
                    Cosa offre la funzione di generazione AI?
                  </h3>
                  <p className="text-neutral-700">
                    Il nostro generatore AI ti aiuta a creare titoli accattivanti e descrizioni dettagliate 
                    per il tuo annuncio. Inserisci le informazioni base sulla proprietà e l'AI produrrà 
                    contenuti ottimizzati per attirare inquilini potenziali, risparmiandoti tempo e fatica.
                  </p>
                </div>
                
                {/* FAQ 6 */}
                <div className="bg-neutral-50 rounded-lg p-6 shadow-md hover:shadow-lg transition-all">
                  <h3 className="text-xl font-bold mb-3 text-[#6a0dad]">
                    Come funziona il suggerimento prezzi?
                  </h3>
                  <p className="text-neutral-700">
                    Il nostro algoritmo di suggerimento prezzi analizza il mercato immobiliare nella zona 
                    specifica, confrontando caratteristiche simili, per suggerirti un prezzo competitivo 
                    per il tuo annuncio. Questo ti aiuta a massimizzare la visibilità e l'attrattività 
                    della tua proprietà.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="bg-gradient-to-r from-[#6a0dad]/90 to-[#6a0dad]/70 rounded-lg p-8 shadow-xl">
              <div className="flex flex-col lg:flex-row items-center justify-between">
                <div className="text-white mb-6 lg:mb-0 text-center lg:text-left">
                  <h2 className="text-3xl font-bold mb-2" style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.3)" }}>
                    Pronto a iniziare?
                  </h2>
                  <p className="text-lg opacity-90 max-w-xl">
                    Registrati gratuitamente e scopri tutte le funzionalità della piattaforma In&Out
                  </p>
                </div>
                <div className="flex flex-wrap gap-4">
                  <Link href="/auth">
                    <Button 
                      size="lg" 
                      className="bg-white text-[#6a0dad] hover:bg-[#ffcb05] hover:text-[#333] shadow-lg transition-all transform hover:scale-105"
                    >
                      Registrati ora
                    </Button>
                  </Link>
                  <Link href="/search">
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="bg-transparent text-white border-white hover:bg-white hover:text-[#6a0dad] shadow-lg transition-all transform hover:scale-105"
                    >
                      Esplora annunci
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}