import { useRouter } from 'next/router';
import Link from 'next/link';
import { Navbar } from '../client/src/components/layout/navbar';
import { Footer } from '../client/src/components/layout/footer';
import SEO from './components/SEO';
import { Button } from '../client/src/components/ui/button';
import { Search, Home, MessageSquare, Shield, Globe, Clock, ArrowRight } from 'lucide-react';
import { generateOrganizationSchema, generateWebPageSchema } from '../client/src/components/seo/SchemaGenerator';

export default function HomePage() {
  const router = useRouter();

  // Genera dati strutturati JSON-LD per la homepage
  const pageSchemaData = generateWebPageSchema({
    title: "In&Out Room - Trova stanze e alloggi in Europa",
    description: "Scopri le migliori stanze e alloggi in tutta Europa. Cerca, confronta e prenota facilmente il tuo alloggio ideale.",
    url: "https://ineoutroom.eu/",
    image: "https://ineoutroom.eu/og-image.jpg",
    lastUpdated: "2025-04-18"
  });
  
  // Aggiungi dati schema.org dell'organizzazione
  const organizationSchemaData = generateOrganizationSchema();
  
  // Combina i diversi schemi JSON-LD
  const combinedSchemaData = [pageSchemaData, organizationSchemaData];

  return (
    <>
      <SEO 
        title="In&Out Room - Trova stanze e alloggi in Europa"
        description="Scopri le migliori stanze e alloggi in tutta Europa. Cerca, confronta e prenota facilmente il tuo alloggio ideale per studio, lavoro o trasferimento. La piattaforma italiana per la ricerca di soluzioni abitative."
        keywords="stanze, alloggi, affitto, europa, studenti, expat, case, appartamenti, ricerca stanze, affitti, stanza singola, stanza doppia, monolocale"
        ogImage="/og-image.jpg"
        ogType="website"
        canonical="/"
        schemaData={combinedSchemaData}
      />

      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-grow">
          {/* Hero Section */}
          <section className="relative gradient-primary text-white">
            <div className="container mx-auto px-4 py-16 md:py-24">
              <div className="max-w-3xl mx-auto text-center">
                <h1 className="font-montserrat font-bold text-3xl md:text-4xl lg:text-5xl mb-6">
                  La tua casa ideale ti aspetta, trovala ora
                </h1>
                <p className="text-lg md:text-xl opacity-90 mb-8">
                  Casa, dolce casa. Ovunque tu vada.
                </p>
                
                <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
                  <Link href="/search">
                    <Button size="lg" className="bg-white text-primary hover:bg-gray-100 shadow-md w-full sm:w-auto">
                      Cerca alloggio
                    </Button>
                  </Link>
                  <Link href="/annuncio/crea">
                    <Button size="lg" className="bg-accent text-white hover:bg-accent/90 shadow-md w-full sm:w-auto">
                      Pubblica annuncio
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Wave decoration */}
            <div className="absolute bottom-0 left-0 right-0">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" fill="#ffffff">
                <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,100L1360,100C1280,100,1120,100,960,100C800,100,640,100,480,100C320,100,160,100,80,100L0,100Z"></path>
              </svg>
            </div>
          </section>
          
          {/* How It Works Section */}
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="text-center max-w-3xl mx-auto mb-12">
                <h2 className="font-montserrat font-bold text-2xl md:text-3xl">Come funziona</h2>
                <p className="text-neutral-600 mt-4">
                  Trovare casa o pubblicare il tuo annuncio non è mai stato così semplice
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                {/* Step 1 */}
                <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 relative">
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                    <Search className="h-5 w-5" />
                  </div>
                  <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold">
                    01
                  </div>
                  <h3 className="font-montserrat font-semibold text-lg mb-2">Registrati</h3>
                  <p className="text-neutral-600 text-sm mb-4">
                    Crea il tuo profilo in pochi minuti e accedi a tutte le funzionalità della piattaforma.
                  </p>
                </div>
                
                {/* Step 2 */}
                <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 relative">
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                    <Home className="h-5 w-5" />
                  </div>
                  <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold">
                    02
                  </div>
                  <h3 className="font-montserrat font-semibold text-lg mb-2">Cerca</h3>
                  <p className="text-neutral-600 text-sm mb-4">
                    Utilizza i nostri filtri avanzati per trovare l'alloggio perfetto in base a zona, prezzo e caratteristiche.
                  </p>
                </div>
                
                {/* Step 3 */}
                <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 relative">
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold">
                    03
                  </div>
                  <h3 className="font-montserrat font-semibold text-lg mb-2">Contatta</h3>
                  <p className="text-neutral-600 text-sm mb-4">
                    Chatta con i proprietari, organizza visite virtuali e ottieni tutte le informazioni che desideri.
                  </p>
                </div>
              </div>
              
              <div className="text-center mt-8">
                <Link href="/come-funziona">
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                    Scopri di più
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>
          
          {/* Perché scegliere In&Out */}
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="text-center max-w-3xl mx-auto mb-12">
                <h2 className="font-montserrat font-bold text-2xl md:text-3xl">Perché scegliere In&Out</h2>
                <p className="text-neutral-600 mt-4">
                  La piattaforma che rivoluziona la ricerca di alloggi in Europa con funzionalità uniche ed esclusive.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Feature 1 */}
                <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 border border-gray-100">
                  <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-6 w-6" />
                  </div>
                  <h3 className="font-montserrat font-semibold text-lg mb-2 text-center">Affidabilità</h3>
                  <p className="text-neutral-600 text-sm text-center">
                    Verifichiamo attentamente tutti gli annunci per garantire un'esperienza sicura e senza sorprese.
                  </p>
                </div>
                
                {/* Feature 2 */}
                <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 border border-gray-100">
                  <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-6 w-6" />
                  </div>
                  <h3 className="font-montserrat font-semibold text-lg mb-2 text-center">Rapidità</h3>
                  <p className="text-neutral-600 text-sm text-center">
                    Trova la tua nuova casa in pochi click grazie a un'interfaccia intuitiva e ricerca ottimizzata.
                  </p>
                </div>
                
                {/* Feature 3 */}
                <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 border border-gray-100">
                  <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <h3 className="font-montserrat font-semibold text-lg mb-2 text-center">Semplicità</h3>
                  <p className="text-neutral-600 text-sm text-center">
                    Comunica direttamente con proprietari o inquilini interessati attraverso la nostra piattaforma.
                  </p>
                </div>
                
                {/* Feature 4 */}
                <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 border border-gray-100">
                  <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Globe className="h-6 w-6" />
                  </div>
                  <h3 className="font-montserrat font-semibold text-lg mb-2 text-center">Internazionale</h3>
                  <p className="text-neutral-600 text-sm text-center">
                    Accedi a un vasto network di alloggi in tutta Europa, ideale per studenti e professionisti internazionali.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
} 