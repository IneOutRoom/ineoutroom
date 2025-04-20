import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from '../client/src/components/layout/navbar';
import { Footer } from '../client/src/components/layout/footer';
import { SearchBox } from '../client/src/components/search/search-box';
import { FilterBar } from '../client/src/components/search/filter-bar';
import { PropertyCard } from '../client/src/components/ui/property-card';
import GoogleMap from '../client/src/components/maps/GoogleMap';
import { Button } from '../client/src/components/ui/button';
import { useToast } from '../client/src/hooks/use-toast';
import { Bell, Loader2 } from 'lucide-react';
import { useGeolocation } from '../client/src/hooks/use-geolocation';
import { apiRequest } from '../client/src/lib/queryClient';
import { useAuth } from '../client/src/hooks/use-auth';
import SEO from './components/SEO';
import { 
  generateWebPageSchema, 
  generateSearchResultsSchema,
  generateOrganizationSchema 
} from '../client/src/components/seo/SchemaGenerator';

export default function PropertySearchPage({ initialProperties }) {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useState({});
  const [showMap, setShowMap] = useState(true);
  const [mapCenter, setMapCenter] = useState(null);
  const { location, error: locationError } = useGeolocation();

  // Estrai i parametri di ricerca dalla query dell'URL quando cambia
  useEffect(() => {
    const query = router.query;
    
    // Costruisci l'oggetto searchParams dal query
    const newSearchParams = {
      city: query.city,
      propertyType: query.type,
      minPrice: query.minPrice ? parseInt(query.minPrice) : undefined,
      maxPrice: query.maxPrice ? parseInt(query.maxPrice) : undefined,
      isFurnished: query.furnished === 'true',
      allowsPets: query.pets === 'true',
      internetIncluded: query.internet === 'true',
    };
    
    // Aggiungi coordinate se presenti
    if (query.lat && query.lng) {
      newSearchParams.latitude = parseFloat(query.lat);
      newSearchParams.longitude = parseFloat(query.lng);
      newSearchParams.radius = query.radius ? parseFloat(query.radius) : 5;
      
      // Centra la mappa sulle coordinate di ricerca
      setMapCenter({
        lat: parseFloat(query.lat),
        lng: parseFloat(query.lng)
      });
    }
    
    setSearchParams(newSearchParams);
  }, [router.query]);

  // Cerca le proprietà in base ai parametri
  const { data: properties, isLoading } = useQuery({
    queryKey: ['/api/properties/search', searchParams],
    queryFn: async () => {
      const response = await apiRequest('POST', '/api/properties/search', searchParams);
      return response.json();
    },
    enabled: Object.keys(searchParams).length > 0,
    initialData: initialProperties,
  });

  const handleSearch = (params) => {
    // Costruisci l'URL di ricerca con i parametri
    const queryParams = new URLSearchParams();
    
    if (params.city) {
      queryParams.set('city', params.city);
    }
    
    if (params.propertyType) {
      queryParams.set('type', params.propertyType);
    }
    
    if (params.maxPrice) {
      queryParams.set('maxPrice', params.maxPrice.toString());
    }
    
    if (params.minPrice) {
      queryParams.set('minPrice', params.minPrice.toString());
    }
    
    // Naviga alla stessa pagina con parametri aggiornati
    router.push({
      pathname: '/search',
      search: queryParams.toString()
    }, undefined, { scroll: false });
  };

  const handleFilterChange = (filters) => {
    // Costruisci l'URL con tutti i parametri di ricerca
    const queryParams = new URLSearchParams(router.query);
    
    // Aggiorna i filtri
    if (filters.isFurnished !== undefined) {
      queryParams.set('furnished', filters.isFurnished.toString());
    }
    
    if (filters.allowsPets !== undefined) {
      queryParams.set('pets', filters.allowsPets.toString());
    }
    
    if (filters.internetIncluded !== undefined) {
      queryParams.set('internet', filters.internetIncluded.toString());
    }
    
    // Naviga alla stessa pagina con filtri aggiornati
    router.push({
      pathname: '/search',
      search: queryParams.toString()
    }, undefined, { scroll: false });
  };

  const handleNearMeSearch = (coords) => {
    const queryParams = new URLSearchParams(router.query);
    queryParams.set('lat', coords.lat.toString());
    queryParams.set('lng', coords.lng.toString());
    queryParams.set('radius', '5'); // 5 km di raggio di default
    
    router.push({
      pathname: '/search',
      search: queryParams.toString()
    }, undefined, { scroll: false });
  };

  const handleSaveSearch = async () => {
    if (!user) {
      toast({
        title: "Accesso richiesto",
        description: "Accedi per salvare questa ricerca",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const response = await apiRequest('POST', '/api/saved-searches', {
        userId: user.id,
        searchParams: JSON.stringify(searchParams),
        name: searchParams.city || 'Ricerca salvata',
      });
      
      if (response.ok) {
        toast({
          title: "Ricerca salvata",
          description: "Riceverai notifiche quando ci saranno nuovi risultati",
        });
      } else {
        throw new Error('Errore durante il salvataggio della ricerca');
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Creazione dati schema.org per la pagina di ricerca
  const pageSchema = generateWebPageSchema({
    title: `Cerca alloggi${searchParams.city ? ` a ${searchParams.city}` : ""} | In&Out Room`,
    description: `Trova stanze e alloggi${searchParams.city ? ` a ${searchParams.city}` : " in Europa"}. Filtra per città, prezzo e caratteristiche per trovare la tua casa ideale.`,
    url: "https://ineoutroom.eu/search",
    lastUpdated: "2025-04-18"
  });

  // Schema per risultati di ricerca
  const searchResultsSchema = generateSearchResultsSchema({
    query: {
      city: searchParams.city,
      propertyType: searchParams.propertyType,
      minPrice: searchParams.minPrice,
      maxPrice: searchParams.maxPrice,
      isFurnished: searchParams.isFurnished,
      allowsPets: searchParams.allowsPets,
      internetIncluded: searchParams.internetIncluded
    },
    results: properties ? properties.map(p => ({
      id: p.id,
      title: p.title,
      price: p.price,
      city: p.city,
      propertyType: p.propertyType,
      url: `https://ineoutroom.eu/annunci/${p.id}`
    })) : []
  });

  // Schema organizzazione
  const organizationSchema = generateOrganizationSchema();

  // Combina tutti gli schemi
  const jsonLdData = [pageSchema, searchResultsSchema, organizationSchema];

  return (
    <>
      <SEO 
        title={`Cerca alloggi${searchParams.city ? ` a ${searchParams.city}` : ""} | In&Out Room`}
        description={`Trova stanze e alloggi${searchParams.city ? ` a ${searchParams.city}` : " in Europa"}. Filtra per città, prezzo e caratteristiche per trovare la tua casa ideale.`}
        keywords={`stanze, alloggi, affitto, europa, ${searchParams.city || ""}, ${searchParams.propertyType || ""}, ricerca alloggi, monolocali, stanze singole`}
        ogType="website"
        canonical="/search"
        jsonLd={jsonLdData}
      />

      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <div className="flex-grow">
          <div className="bg-primary/5 py-6">
            <div className="container mx-auto px-4">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="w-full md:max-w-md">
                  <SearchBox 
                    onSearch={handleSearch}
                    onNearMe={() => {
                      if (location) {
                        handleNearMeSearch(location);
                      } else {
                        toast({
                          title: "Geolocalizzazione non disponibile",
                          description: "Controlla le impostazioni del browser",
                          variant: "destructive",
                        });
                      }
                    }}
                    initialValues={searchParams}
                  />
                </div>
                
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <Button
                    variant="outline"
                    className="flex-1 md:flex-auto"
                    onClick={handleSaveSearch}
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Salva ricerca
                  </Button>
                  
                  <Button
                    variant={showMap ? "default" : "outline"}
                    className="flex-1 md:flex-auto"
                    onClick={() => setShowMap(!showMap)}
                  >
                    {showMap ? "Nascondi mappa" : "Mostra mappa"}
                  </Button>
                </div>
              </div>
              
              <div className="mt-4">
                <FilterBar 
                  onChange={handleFilterChange} 
                  initialValues={{
                    isFurnished: searchParams.isFurnished,
                    allowsPets: searchParams.allowsPets,
                    internetIncluded: searchParams.internetIncluded,
                  }}
                />
              </div>
            </div>
          </div>
          
          <div className="container mx-auto px-4 py-8">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="flex flex-col lg:flex-row gap-6">
                <div className={`${showMap ? 'lg:w-1/2' : 'w-full'}`}>
                  <div className="mb-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold">
                      {properties?.length || 0} risultati trovati
                      {searchParams.city && ` a ${searchParams.city}`}
                    </h2>
                  </div>
                  
                  {properties?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {properties.map((property) => (
                        <PropertyCard key={property.id} property={property} />
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-8 rounded-lg text-center">
                      <h3 className="text-lg font-medium mb-2">Nessun risultato trovato</h3>
                      <p className="text-gray-500 mb-4">
                        Prova a modificare i filtri di ricerca o a cercare in un'altra zona.
                      </p>
                    </div>
                  )}
                </div>
                
                {showMap && (
                  <div className="lg:w-1/2 h-[calc(100vh-300px)] sticky top-20">
                    <GoogleMap 
                      center={mapCenter || { lat: 41.9028, lng: 12.4964 }} // Default: Roma
                      zoom={12}
                      markers={properties ? properties.map(property => ({
                        id: `property-${property.id}`,
                        position: { 
                          lat: property.latitude || 41.9028, 
                          lng: property.longitude || 12.4964 
                        },
                        title: property.title,
                        description: `${property.propertyType} - €${(property.price/100).toFixed(2)}/mese`
                      })).filter(marker => marker.position.lat && marker.position.lng) : []}
                      onMarkerClick={(marker) => {
                        // Navigazione alla pagina di dettaglio dell'annuncio
                        const propertyId = marker.id.replace('property-', '');
                        router.push(`/annunci/${propertyId}`);
                      }}
                      className="rounded-lg shadow-md"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <Footer />
      </div>
    </>
  );
}

// Ottieni proprietà pre-renderizzate in fase di build
export async function getStaticProps() {
  try {
    // In produzione, usa un URL assoluto al tuo backend o il baseUrl configurato
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    
    // Ottieni le città più popolari per le ricerche iniziali
    const popularCities = ['Milano', 'Roma', 'Firenze', 'Bologna', 'Torino', 'Napoli'];
    
    // Fai una richiesta per ogni città popolare
    const cityRequests = popularCities.map(city => 
      fetch(`${baseUrl}/api/properties/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          city,
          isActive: true,
          limit: 5,
        }),
      }).then(res => res.json())
    );

    // Ottieni anche alcune proprietà senza filtri città (risultati generali)
    const generalRequest = fetch(`${baseUrl}/api/properties/search`, {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        isActive: true,
        limit: 20,
      }),
    }).then(res => res.json());

    // Attendi tutte le richieste
    const [generalResults, ...cityResults] = await Promise.all([
      generalRequest,
      ...cityRequests
    ]);

    // Combina i risultati e rimuovi duplicati
    const allProperties = [...generalResults];
    
    // Aggiungi risultati dalle città ma evita duplicati
    cityResults.forEach(cityResult => {
      cityResult.forEach(property => {
        if (!allProperties.some(p => p.id === property.id)) {
          allProperties.push(property);
        }
      });
    });
    
    // Limita a massimo 30 risultati
    const initialProperties = allProperties.slice(0, 30);

    return {
      props: {
        initialProperties,
      },
      // Rigenera la pagina ogni 10 minuti
      revalidate: 600,
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