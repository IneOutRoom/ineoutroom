import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Navbar } from '../client/src/components/layout/navbar';
import { Footer } from '../client/src/components/layout/footer';
import SEO from './components/SEO';
import { Button } from '../client/src/components/ui/button';
import { Search, Home, MessageSquare, Shield, Globe, Clock, ArrowRight, MapPin, Star, Heart } from 'lucide-react';
import { generateOrganizationSchema, generateWebPageSchema } from '../client/src/components/seo/SchemaGenerator';
import DirectCookieBanner from './components/DirectCookieBanner';

// Componenti modulari per organizzare meglio il codice
const HeroSection = () => {
  return (
    <section className="relative gradient-primary text-white min-h-[80vh] flex items-center">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-montserrat font-bold text-3xl md:text-5xl lg:text-6xl mb-6 leading-tight">
            La tua casa ideale <span className="text-yellow-300">ti aspetta</span>, 
            <br className="hidden md:block" /> trovala ora
          </h1>
          <p className="text-lg md:text-xl opacity-90 mb-12 max-w-xl mx-auto">
            Casa, dolce casa. Ovunque tu vada. La piattaforma italiana per trovare il tuo alloggio in Europa.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-5 mt-8">
            <Link href="/search">
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100 shadow-lg w-full sm:w-auto text-lg px-8 py-6 h-auto font-semibold">
                <Search className="h-5 w-5 mr-2" />
                Cerca alloggio
              </Button>
            </Link>
            <Link href="/annuncio/crea">
              <Button size="lg" className="bg-yellow-400 text-primary hover:bg-yellow-300 shadow-lg w-full sm:w-auto text-lg px-8 py-6 h-auto font-semibold">
                <Home className="h-5 w-5 mr-2" />
                Pubblica annuncio
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Wave decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" fill="#ffffff">
          <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
        </svg>
      </div>
    </section>
  );
};

const HowItWorksSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-montserrat font-bold text-3xl md:text-4xl mb-4">Come funziona</h2>
          <p className="text-neutral-600 text-lg mt-4">
            Trovare casa o pubblicare il tuo annuncio non è mai stato così semplice
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-14">
          {/* Step 1 */}
          <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 relative">
            <div className="w-14 h-14 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
              <Search className="h-6 w-6" />
            </div>
            <div className="absolute top-8 right-8 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
              01
            </div>
            <h3 className="font-montserrat font-semibold text-xl mb-3">Registrati</h3>
            <p className="text-neutral-600 mb-6">
              Crea il tuo profilo in pochi minuti e accedi a tutte le funzionalità della piattaforma, personalizzando le tue preferenze.
            </p>
          </div>
          
          {/* Step 2 */}
          <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 relative">
            <div className="w-14 h-14 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
              <Home className="h-6 w-6" />
            </div>
            <div className="absolute top-8 right-8 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
              02
            </div>
            <h3 className="font-montserrat font-semibold text-xl mb-3">Cerca</h3>
            <p className="text-neutral-600 mb-6">
              Utilizza i nostri filtri avanzati per trovare l'alloggio perfetto in base a zona, prezzo e caratteristiche che desideri.
            </p>
          </div>
          
          {/* Step 3 */}
          <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 relative">
            <div className="w-14 h-14 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div className="absolute top-8 right-8 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
              03
            </div>
            <h3 className="font-montserrat font-semibold text-xl mb-3">Contatta</h3>
            <p className="text-neutral-600 mb-6">
              Chatta con i proprietari, organizza visite virtuali e ottieni tutte le informazioni che desideri in tempo reale.
            </p>
          </div>
        </div>
        
        <div className="text-center mt-10">
          <Link href="/come-funziona">
            <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-white px-8 py-6 h-auto font-medium text-lg">
              Scopri di più
              <ArrowRight className="ml-3 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

const FeaturesSection = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-montserrat font-bold text-3xl md:text-4xl mb-4">Perché scegliere In&Out</h2>
          <p className="text-neutral-600 text-lg mt-4">
            La piattaforma che rivoluziona la ricerca di alloggi in Europa con funzionalità uniche ed esclusive
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Feature 1 */}
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 group">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-300">
              <Shield className="h-7 w-7" />
            </div>
            <h3 className="font-montserrat font-semibold text-xl mb-3 text-center">Affidabilità</h3>
            <p className="text-neutral-600 text-center">
              Verifichiamo attentamente tutti gli annunci per garantire un'esperienza sicura e senza sorprese.
            </p>
          </div>
          
          {/* Feature 2 */}
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 group">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-300">
              <Clock className="h-7 w-7" />
            </div>
            <h3 className="font-montserrat font-semibold text-xl mb-3 text-center">Rapidità</h3>
            <p className="text-neutral-600 text-center">
              Trova la tua nuova casa in pochi click grazie a un'interfaccia intuitiva e ricerca ottimizzata.
            </p>
          </div>
          
          {/* Feature 3 */}
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 group">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-300">
              <Heart className="h-7 w-7" />
            </div>
            <h3 className="font-montserrat font-semibold text-xl mb-3 text-center">Semplicità</h3>
            <p className="text-neutral-600 text-center">
              Comunica direttamente con proprietari o inquilini interessati attraverso la nostra piattaforma.
            </p>
          </div>
          
          {/* Feature 4 */}
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 group">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-300">
              <Globe className="h-7 w-7" />
            </div>
            <h3 className="font-montserrat font-semibold text-xl mb-3 text-center">Internazionale</h3>
            <p className="text-neutral-600 text-center">
              Accedi a un vasto network di alloggi in tutta Europa, ideale per studenti e professionisti internazionali.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

const MapSection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="bg-primary/5 rounded-xl p-8 lg:p-12 flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
          <div className="lg:w-1/2">
            <h2 className="font-montserrat font-bold text-2xl md:text-3xl mb-4">Esplora la mappa interattiva</h2>
            <p className="text-neutral-600 mb-6">
              Visualizza gli alloggi disponibili direttamente sulla mappa e scopri il quartiere, i servizi e i punti di interesse nelle vicinanze.
            </p>
            <div className="flex space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-primary rounded-full mr-2"></div>
                <span className="text-sm text-neutral-600">Stanze</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                <span className="text-sm text-neutral-600">Appartamenti</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-teal-500 rounded-full mr-2"></div>
                <span className="text-sm text-neutral-600">Case</span>
              </div>
            </div>
            <div className="mt-8">
              <Link href="/mappa">
                <Button className="bg-primary text-white hover:bg-primary/90">
                  <MapPin className="h-5 w-5 mr-2" />
                  Apri la mappa
                </Button>
              </Link>
            </div>
          </div>
          <div className="lg:w-1/2">
            <div className="bg-white rounded-lg shadow-md border border-gray-200 aspect-video overflow-hidden relative">
              {/* Placeholder per la mappa */}
              <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-primary/40 mx-auto mb-2" />
                  <p className="text-neutral-500">Mappa interattiva</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const TestimonialSection = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="font-montserrat font-bold text-2xl md:text-3xl mb-4">Cosa dicono di noi</h2>
          <p className="text-neutral-600">Le esperienze di chi ha trovato casa con In&Out</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Testimonial 1 */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="flex text-yellow-400">
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
              </div>
            </div>
            <p className="text-neutral-600 italic mb-6">
              "Ho trovato la mia stanza a Milano in meno di una settimana. La piattaforma è intuitiva e il contatto diretto con i proprietari ha reso tutto più semplice!"
            </p>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
              <div>
                <h4 className="font-medium">Marco B.</h4>
                <p className="text-sm text-neutral-500">Studente a Milano</p>
              </div>
            </div>
          </div>
          
          {/* Testimonial 2 */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="flex text-yellow-400">
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
              </div>
            </div>
            <p className="text-neutral-600 italic mb-6">
              "Come proprietaria di più appartamenti, posso gestire facilmente tutti gli annunci. Le richieste sono sempre pertinenti e di qualità."
            </p>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
              <div>
                <h4 className="font-medium">Laura M.</h4>
                <p className="text-sm text-neutral-500">Proprietaria a Roma</p>
              </div>
            </div>
          </div>
          
          {/* Testimonial 3 */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="flex text-yellow-400">
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
              </div>
            </div>
            <p className="text-neutral-600 italic mb-6">
              "Trasferirsi a Barcellona era la mia grande preoccupazione, ma grazie a In&Out ho trovato un appartamento ideale ancora prima di partire dall'Italia!"
            </p>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
              <div>
                <h4 className="font-medium">Giulia T.</h4>
                <p className="text-sm text-neutral-500">Expat a Barcellona</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default function HomePage() {
  const router = useRouter();

  // Effetto per scrollare all'inizio quando si carica la pagina
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Genera dati strutturati JSON-LD per la homepage
  const pageSchemaData = generateWebPageSchema({
    title: "In&Out Room - Trova stanze e alloggi in Europa",
    description: "Scopri le migliori stanze e alloggi in tutta Europa. Cerca, confronta e prenota facilmente il tuo alloggio ideale.",
    url: "https://ineoutroom.eu/",
    image: "https://ineoutroom.eu/og-image.jpg",
    lastUpdated: new Date().toISOString().split('T')[0]
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
        <DirectCookieBanner />
        
        <main className="flex-grow">
          <HeroSection />
          <HowItWorksSection />
          <FeaturesSection />
          <MapSection />
          <TestimonialSection />
        </main>
        
        <Footer />
      </div>
    </>
  );
} 