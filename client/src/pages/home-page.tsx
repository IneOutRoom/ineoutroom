import { useRef } from 'react';
import { useLocation } from 'wouter';
import { Navbar } from '@/components/layout/navbar';
import { SearchBox } from '@/components/search/search-box';
import { Features } from '@/components/home/features';
import { SubscriptionPlans } from '@/components/home/subscription-plans';
import { AppPromotion } from '@/components/home/app-promotion';
import { Newsletter } from '@/components/home/newsletter';
import { Footer } from '@/components/layout/footer';
import { RecommendationCarousel } from '@/components/recommendations/RecommendationCarousel';
import { SentryQuickTest } from '@/components/error-testing/SentryQuickTest';
import { PerformanceTest } from '@/components/error-testing/PerformanceTest';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';

export default function HomePage() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();

  const handleSearch = (searchParams: any) => {
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
    setLocation(`/search?${queryParams.toString()}`);
  };

  const handleNearMeSearch = (coords: { lat: number; lng: number }) => {
    const queryParams = new URLSearchParams();
    queryParams.set('lat', coords.lat.toString());
    queryParams.set('lng', coords.lng.toString());
    queryParams.set('radius', '5'); // 5 km di raggio di default
    
    setLocation(`/search?${queryParams.toString()}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section with Search */}
        <section className="relative gradient-primary text-white">
          <div className="container mx-auto px-4 py-10 md:py-20">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="font-montserrat font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-4 md:mb-6 leading-tight break-words hyphens-auto">
                La tua casa ideale ti aspetta, trovala ora
              </h1>
              <p className="text-base sm:text-lg md:text-xl opacity-90 mb-6 md:mb-8">
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
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" fill="#ffffff" className="w-full">
              <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,100L1360,100C1280,100,1120,100,960,100C800,100,640,100,480,100C320,100,160,100,80,100L0,100Z"></path>
            </svg>
          </div>
        </section>
        
        {/* Features Section */}
        <Features />
        
        {/* Recommendations Section - Show only if user is authenticated */}
        {user && <RecommendationCarousel />}
        
        {/* Subscription Plans Section */}
        <SubscriptionPlans />
        
        {/* App Promotion Section */}
        <AppPromotion />
        
        {/* Newsletter Section */}
        <Newsletter />
        
        {/* Admin Section - Solo per test in dev */}
        {import.meta.env.DEV && (
          <section className="py-8 bg-gray-50">
            <div className="container mx-auto px-4">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">🛠️ Strumenti Sviluppatore</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="col-span-1">
                  <SentryQuickTest />
                </div>
                <div className="col-span-1">
                  <PerformanceTest />
                </div>
                <div className="col-span-1">
                  <Card className="border-2 border-green-200 bg-green-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <div className="h-5 w-5 text-green-500 flex items-center justify-center">✓</div>
                        Test Status API
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">
                        API endpoint di monitoraggio attivi
                      </p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li className="flex items-center gap-1">
                          <div className="h-3 w-3 rounded-full bg-green-400 flex-shrink-0"></div>
                          <span className="font-mono">/api/test-latency</span>
                        </li>
                        <li className="flex items-center gap-1">
                          <div className="h-3 w-3 rounded-full bg-green-400 flex-shrink-0"></div>
                          <span className="font-mono">/api/test-error</span>
                        </li>
                        <li className="flex items-center gap-1">
                          <div className="h-3 w-3 rounded-full bg-green-400 flex-shrink-0"></div>
                          <span className="font-mono">sentry-test-page</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
