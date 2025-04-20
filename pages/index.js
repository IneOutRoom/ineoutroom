import { useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Navbar } from '../client/src/components/layout/navbar';
import { SearchBox } from '../client/src/components/search/search-box';
import { Features } from '../client/src/components/home/features';
import { HowItWorks } from '../client/src/components/home/how-it-works';
import { SubscriptionPlans } from '../client/src/components/home/subscription-plans';
import { AppPromotion } from '../client/src/components/home/app-promotion';
import { Newsletter } from '../client/src/components/home/newsletter';
import { Footer } from '../client/src/components/layout/footer';
import { RecommendationCarousel } from '../client/src/components/recommendations/RecommendationCarousel';
import { FreeListingBanner } from '../client/src/components/home/free-listing-banner';
import { ListingsGrid } from '../client/src/components/listings/ListingsGrid';
import { useAuth } from '../client/src/hooks/use-auth';
import SEO from './components/SEO';
import DirectCookieBanner from './components/DirectCookieBanner';
import { ArrowRight } from 'lucide-react';
import { generateOrganizationSchema, generateWebPageSchema } from '../client/src/components/seo/SchemaGenerator';

export default function HomePage({ initialProperties }) {
  const router = useRouter();
  const { user } = useAuth();

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

  const handleSearch = (searchParams) => {
    // Costruisci l'URL di ricerca con i parametri
    const queryParams = new URLSearchParams();
    
    if (searchParams.city) {
      queryParams.set('city', searchParams.city);
    }
    
    if (searchParams.propertyType) {
      queryParams.set('type', searchParams.propertyType);
    }
    
    if (searchParams.maxPrice) {
      queryParams.set('maxPrice', searchParams.maxPrice.toString());
    }
    
    // Naviga alla pagina di ricerca con i parametri
    router.push(`/search?${queryParams.toString()}`);
  };

  const handleNearMeSearch = (coords) => {
    const queryParams = new URLSearchParams();
    queryParams.set('lat', coords.lat.toString());
    queryParams.set('lng', coords.lng.toString());
    queryParams.set('radius', '5'); // 5 km di raggio di default
    
    router.push(`/search?${queryParams.toString()}`);
  };

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
        <FreeListingBanner />
        <DirectCookieBanner />
        
        <main className="flex-grow">
          {/* Hero Section with Search */}
          <section className="relative gradient-primary text-white">
            <div className="container mx-auto px-4 py-12 md:py-20">
              <div className="max-w-3xl mx-auto text-center">
                <h1 className="font-montserrat font-bold text-3xl md:text-4xl lg:text-5xl mb-6">
                  La tua casa ideale ti aspetta, trovala ora
                </h1>
                <p className="text-lg md:text-xl opacity-90 mb-8">
                  Casa, dolce casa. Ovunque tu vada.
                </p>
                
                <SearchBox 
                  onSearch={handleSearch}
                  onNearMe={handleNearMeSearch}
                />
              </div>
            </div>
            
            {/* Wave decoration */}
            <div className="absolute bottom-0 left-0 right-0">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" fill="#ffffff">
                <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,100L1360,100C1280,100,1120,100,960,100C800,100,640,100,480,100C320,100,160,100,80,100L0,100Z"></path>
              </svg>
            </div>
          </section>
          
          {/* Features Section */}
          <Features />
          
          {/* How It Works Section */}
          <HowItWorks />
          
          {/* Annunci Disponibili Section */}
          <section className="py-12 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold mb-2">Annunci Disponibili</h2>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                  Sfoglia le migliori soluzioni abitative in tutta Europa. Trova la tua prossima casa ideale tra le nostre proposte selezionate.
                </p>
              </div>
              
              <div className="mt-8">
                <ListingsGrid />
              </div>
              
              <div className="mt-10 text-center">
                <Link 
                  href="/annunci" 
                  className="inline-flex items-center px-6 py-3 rounded-md bg-primary text-white hover:bg-primary/90 transition-colors"
                >
                  Vedi tutti gli annunci
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>
          
          {/* Recommendations Section - Show only if user is authenticated */}
          {user && <RecommendationCarousel initialProperties={initialProperties} />}
          
          {/* Subscription Plans Section */}
          <SubscriptionPlans />
          
          {/* App Promotion Section */}
          <AppPromotion />
          
          {/* Newsletter Section */}
          <Newsletter />
        </main>
        
        <Footer />
      </div>
    </>
  );
}

// Funzione per ottenere i dati statici al momento della build
export async function getStaticProps() {
  try {
    // Questa richiesta sarà fatta solo una volta durante la build di Next.js
    // In produzione, dovresti usare il tuo client HTTP preferito
    const res = await fetch('http://localhost:5000/api/properties/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Filtri di base per ottenere le proprietà in evidenza
        isActive: true,
        limit: 10,
      }),
    });

    const initialProperties = await res.json();

    return {
      props: {
        initialProperties,
      },
      // Rigenera la pagina ogni 60 secondi al massimo
      revalidate: 60,
    };
  } catch (error) {
    console.error('Errore durante il recupero delle proprietà iniziali:', error);
    
    return {
      props: {
        initialProperties: [],
      },
      revalidate: 60,
    };
  }
}