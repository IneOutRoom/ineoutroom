import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { SearchBox } from '@/components/search/search-box';
import { FilterBar } from '@/components/search/filter-bar';
import { PropertyCard } from '@/components/ui/property-card';
import { Map } from '@/components/ui/map';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Bell, Loader2, MapPin } from 'lucide-react';
import { useGeolocation } from '@/hooks/use-geolocation';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { PropertySearch } from '@shared/schema';

// Property feature icons
import { Wifi, Wind, Home, Users, Bath, Ruler, Utensils, Network } from 'lucide-react';

interface FilterBadge {
  id: string;
  label: string;
  value: string;
}

export default function PropertySearchPage() {
  const [location, setLocation] = useLocation();
  const params = location.split('?')[1];
  const searchParams = new URLSearchParams(params || '');
  const { toast } = useToast();
  const { user } = useAuth();
  const [filters, setFilters] = useState<FilterBadge[]>([]);
  const [view, setView] = useState<'list' | 'map'>('list');
  const [favorites, setFavorites] = useState<number[]>([]);
  const { getPosition, loading: isGeolocating } = useGeolocation();
  
  // Parametri di ricerca
  const [searchCriteria, setSearchCriteria] = useState<PropertySearch>({
    city: searchParams.get('city') || undefined,
    propertyType: (searchParams.get('type') as any) || undefined,
    maxPrice: searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined,
    latitude: searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : undefined,
    longitude: searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : undefined,
    radius: searchParams.get('radius') ? parseInt(searchParams.get('radius')!) : undefined,
  });

  // Configurare i filtri in base ai parametri URL iniziali
  useEffect(() => {
    const initialFilters: FilterBadge[] = [];
    
    if (searchCriteria.city) {
      initialFilters.push({ id: 'city', label: searchCriteria.city, value: searchCriteria.city });
    }
    
    if (searchCriteria.propertyType) {
      const propertyTypeMap: Record<string, string> = {
        stanza_singola: 'Stanza singola',
        stanza_doppia: 'Stanza doppia',
        monolocale: 'Monolocale',
        bilocale: 'Bilocale',
        altro: 'Altra tipologia',
      };
      initialFilters.push({ 
        id: 'propertyType', 
        label: propertyTypeMap[searchCriteria.propertyType] || searchCriteria.propertyType, 
        value: searchCriteria.propertyType 
      });
    }
    
    if (searchCriteria.maxPrice) {
      initialFilters.push({ 
        id: 'maxPrice', 
        label: `Max ${searchCriteria.maxPrice}€`, 
        value: searchCriteria.maxPrice.toString() 
      });
    }
    
    if (searchCriteria.latitude && searchCriteria.longitude && searchCriteria.radius) {
      initialFilters.push({ 
        id: 'location', 
        label: `Vicino a me (${searchCriteria.radius} km)`, 
        value: `${searchCriteria.latitude},${searchCriteria.longitude},${searchCriteria.radius}` 
      });
    }
    
    setFilters(initialFilters);
  }, []);

  // Query per ottenere le proprietà in base ai criteri di ricerca
  const { data: properties, isLoading, refetch } = useQuery({
    queryKey: ['/api/properties/search', searchCriteria],
    queryFn: async () => {
      const res = await apiRequest('POST', '/api/properties/search', searchCriteria);
      return await res.json();
    },
  });

  // Gestisce la ricerca
  const handleSearch = (newSearchParams: any) => {
    const newFilters: FilterBadge[] = [];
    
    const newCriteria: PropertySearch = {};
    
    if (newSearchParams.city) {
      newCriteria.city = newSearchParams.city;
      newFilters.push({ id: 'city', label: newSearchParams.city, value: newSearchParams.city });
    }
    
    if (newSearchParams.propertyType) {
      newCriteria.propertyType = newSearchParams.propertyType;
      const propertyTypeMap: Record<string, string> = {
        stanza_singola: 'Stanza singola',
        stanza_doppia: 'Stanza doppia',
        monolocale: 'Monolocale',
        bilocale: 'Bilocale',
        altro: 'Altra tipologia',
      };
      newFilters.push({ 
        id: 'propertyType', 
        label: propertyTypeMap[newSearchParams.propertyType] || newSearchParams.propertyType, 
        value: newSearchParams.propertyType 
      });
    }
    
    if (newSearchParams.maxPrice) {
      newCriteria.maxPrice = newSearchParams.maxPrice;
      newFilters.push({ 
        id: 'maxPrice', 
        label: `Max ${newSearchParams.maxPrice}€`, 
        value: newSearchParams.maxPrice.toString() 
      });
    }
    
    setSearchCriteria(newCriteria);
    setFilters(newFilters);
  };

  // Gestisce la ricerca "vicino a me"
  const handleNearMeSearch = (coords: { lat: number; lng: number }) => {
    const radius = 5; // 5 km di default
    const newCriteria = {
      ...searchCriteria,
      latitude: coords.lat,
      longitude: coords.lng,
      radius: radius
    };
    
    // Aggiungi o aggiorna il filtro di posizione
    const newFilters = filters.filter(f => f.id !== 'location');
    newFilters.push({ 
      id: 'location', 
      label: `Vicino a me (${radius} km)`, 
      value: `${coords.lat},${coords.lng},${radius}` 
    });
    
    setSearchCriteria(newCriteria);
    setFilters(newFilters);
  };

  // Rimuove un filtro
  const removeFilter = (id: string) => {
    const newFilters = filters.filter(f => f.id !== id);
    
    // Aggiorna anche i criteri di ricerca
    const newCriteria = { ...searchCriteria };
    
    if (id === 'city') delete newCriteria.city;
    if (id === 'propertyType') delete newCriteria.propertyType;
    if (id === 'maxPrice') delete newCriteria.maxPrice;
    if (id === 'location') {
      delete newCriteria.latitude;
      delete newCriteria.longitude;
      delete newCriteria.radius;
    }
    
    setSearchCriteria(newCriteria);
    setFilters(newFilters);
  };
  
  // Ripulisce tutti i filtri
  const clearFilters = () => {
    setSearchCriteria({});
    setFilters([]);
  };

  // Gestisce l'ordinamento
  const handleSortChange = (sortValue: string) => {
    // L'ordinamento avverrà lato client per ora
    // In produzione, dovrebbe essere gestito dal backend
    let sortedProperties = [...(properties || [])];
    
    switch (sortValue) {
      case 'price_asc':
        sortedProperties.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        sortedProperties.sort((a, b) => b.price - a.price);
        break;
      case 'date_desc':
        sortedProperties.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      default:
        // relevance - default sorting from API
        break;
    }
  };

  // Gestisce l'aggiunta ai preferiti
  const handleFavoriteToggle = (id: number) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(favId => favId !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  // Gestisce il salvataggio della ricerca (richiede autenticazione)
  const handleSaveSearch = () => {
    if (!user) {
      toast({
        title: "Autenticazione richiesta",
        description: "Accedi o registrati per salvare questa ricerca",
        variant: "destructive",
      });
      return;
    }
    
    // In produzione, qui salverebbe la ricerca nel database
    toast({
      title: "Ricerca salvata",
      description: "Riceverai notifiche quando verranno pubblicati nuovi annunci",
    });
  };

  // Prepara i dati per la mappa
  const mapMarkers = properties ? properties.map((property: any) => ({
    id: property.id,
    position: { 
      lat: property.latitude || 41.9028, 
      lng: property.longitude || 12.4964 
    },
    title: property.title
  })) : [];

  // Dati di esempio per le caratteristiche delle proprietà
  const getPropertyFeatures = (property: any) => {
    const features = [];
    
    if (property.squareMeters) {
      features.push({ icon: <Ruler className="h-4 w-4 mr-1" />, text: `${property.squareMeters}m²` });
    }
    
    // Estrai le caratteristiche dal campo features (JSON)
    if (property.features) {
      const featuresObj = typeof property.features === 'string' 
        ? JSON.parse(property.features) 
        : property.features;
      
      if (featuresObj.coinquilini) {
        features.push({ icon: <Users className="h-4 w-4 mr-1" />, text: `${featuresObj.coinquilini} coinquilini` });
      }
      
      if (featuresObj.wifi) {
        features.push({ icon: <Wifi className="h-4 w-4 mr-1" />, text: 'Wi-Fi' });
      }
      
      if (featuresObj.ariaCondizionata) {
        features.push({ icon: <Wind className="h-4 w-4 mr-1" />, text: 'Aria condizionata' });
      }
      
      if (featuresObj.bagni) {
        features.push({ icon: <Bath className="h-4 w-4 mr-1" />, text: `${featuresObj.bagni} bagni` });
      }
      
      if (featuresObj.cucina) {
        features.push({ icon: <Utensils className="h-4 w-4 mr-1" />, text: 'Cucina' });
      }
      
      if (featuresObj.balcone) {
        features.push({ icon: <Network className="h-4 w-4 mr-1" />, text: 'Balcone' });
      }
    }
    
    return features;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section with Search */}
        <section className="relative bg-gradient-to-r from-[#6a0dad]/90 to-[#6a0dad]/70 text-white py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.3)" }}>
                Trova il tuo alloggio ideale in Europa
              </h1>
              <p className="text-xl opacity-90 max-w-2xl mx-auto">
                Cerca tra migliaia di stanze e appartamenti nelle principali città europee
              </p>
            </div>
            
            <div className="max-w-3xl mx-auto">
              <div className="bg-white p-4 rounded-lg shadow-lg">
                <SearchBox 
                  onSearch={handleSearch}
                  onNearMe={handleNearMeSearch}
                  className="mb-0"
                />
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
        
        {/* Filter Bar */}
        <div className="container mx-auto px-4 py-6">
          {/* Filtri attivi */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {filters.map(filter => (
              <div 
                key={filter.id} 
                className="bg-[#6a0dad]/10 text-[#6a0dad] px-3 py-1.5 rounded-full text-sm font-medium flex items-center shadow-sm transition-all hover:shadow"
              >
                {filter.label}
                <button 
                  onClick={() => removeFilter(filter.id)}
                  className="ml-2 text-[#6a0dad]/70 hover:text-[#6a0dad] transition-colors"
                  aria-label={`Rimuovi filtro ${filter.label}`}
                >
                  ×
                </button>
              </div>
            ))}
            
            {filters.length > 0 && (
              <button 
                onClick={clearFilters}
                className="text-[#6a0dad] hover:text-[#6a0dad]/80 text-sm font-medium transition-colors"
              >
                Cancella tutti
              </button>
            )}
          </div>
          
          {/* Barra degli strumenti */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center gap-2">
              <Button
                variant={view === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('list')}
                className={`rounded-l-md rounded-r-none transition-all ${view === 'list' ? 'bg-[#6a0dad] hover:bg-[#6a0dad]/90' : 'hover:text-[#6a0dad] hover:border-[#6a0dad]'}`}
              >
                Lista
              </Button>
              <Button
                variant={view === 'map' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('map')}
                className={`rounded-l-none rounded-r-md transition-all ${view === 'map' ? 'bg-[#6a0dad] hover:bg-[#6a0dad]/90' : 'hover:text-[#6a0dad] hover:border-[#6a0dad]'}`}
              >
                Mappa
              </Button>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <FilterBar 
                onSortChange={(value) => {
                  console.log('Sort by:', value);
                  // Implementa la logica di ordinamento
                }} 
                onViewChange={(view) => setView(view)}
                currentView={view}
                activeFilters={filters}
                onRemoveFilter={removeFilter}
                resultsCount={properties?.length || 0}
              />
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveSearch}
                className="flex items-center gap-1 hover:bg-[#6a0dad]/10 hover:text-[#6a0dad] hover:border-[#6a0dad] transition-all"
              >
                <Bell className="h-4 w-4" />
                Salva ricerca
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation('/property-map')}
                className="flex items-center gap-1 hover:bg-[#6a0dad]/10 hover:text-[#6a0dad] hover:border-[#6a0dad] transition-all"
              >
                <MapPin className="h-4 w-4" />
                Mappa Airbnb
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  if (!isGeolocating) {
                    getPosition().then((pos) => {
                      if (pos) {
                        handleNearMeSearch(pos);
                      }
                    });
                  }
                }}
                disabled={isGeolocating}
                className="hover:bg-[#6a0dad]/10 hover:text-[#6a0dad] hover:border-[#6a0dad] transition-all"
              >
                {isGeolocating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    Ricerca...
                  </>
                ) : (
                  'Vicino a me'
                )}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Results Section */}
        <section className="py-4">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Results Column */}
              {view === 'list' && (
                <div className="w-full lg:w-3/5">
                  <div className="mb-6 flex justify-between items-center">
                    <h2 className="font-bold text-xl text-[#333]">
                      {isLoading ? (
                        <div className="flex items-center">
                          <Loader2 className="h-5 w-5 mr-2 animate-spin text-[#6a0dad]" />
                          Ricerca in corso...
                        </div>
                      ) : (
                        <span className="flex items-center">
                          <span className="bg-[#6a0dad] text-white rounded-full px-3 py-1 text-sm mr-2">
                            {properties?.length || 0}
                          </span>
                          alloggi trovati
                        </span>
                      )}
                    </h2>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setLocation('/property-map')}
                        variant="outline"
                        className="flex items-center text-sm text-primary font-medium"
                      >
                        <MapPin className="mr-2 h-4 w-4" />
                        <span>Mappa Airbnb</span>
                      </Button>
                      <Button
                        onClick={handleSaveSearch}
                        variant="outline"
                        className="flex items-center text-sm text-primary font-medium"
                      >
                        <Bell className="mr-2 h-4 w-4" />
                        <span>Attiva notifiche</span>
                      </Button>
                    </div>
                  </div>
                  
                  {isLoading ? (
                    <div className="flex justify-center py-12">
                      <div className="flex flex-col items-center">
                        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                        <p className="text-neutral-500">Ricerca in corso...</p>
                      </div>
                    </div>
                  ) : properties && properties.length > 0 ? (
                    <>
                      {properties.map((property: any) => (
                        <PropertyCard
                          key={property.id}
                          id={property.id}
                          title={property.title}
                          propertyType={property.propertyType}
                          price={property.price / 100} // Il prezzo è memorizzato in centesimi
                          city={property.city}
                          zone={property.zone}
                          imageUrl={property.photos && property.photos.length > 0 
                            ? property.photos[0] 
                            : "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"}
                          features={getPropertyFeatures(property)}
                          hostName={property.hostName || "Proprietario"}
                          hostImage={property.hostImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80"}
                          timeAgo="Recente"
                          isNew={new Date(property.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000}
                          onFavoriteClick={handleFavoriteToggle}
                          isFavorite={favorites.includes(property.id)}
                        />
                      ))}
                      
                      {/* Load more button */}
                      <div className="text-center mt-8 mb-4">
                        <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white transition-colors font-medium py-3 px-8 rounded-full shadow-hover">
                          Carica altri risultati
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="py-12 text-center">
                      <div className="bg-neutral-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                        <Home className="h-10 w-10 text-neutral-400" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Nessun risultato trovato</h3>
                      <p className="text-neutral-500 mb-6">
                        Prova a modificare i filtri di ricerca o a cercare in un'altra zona.
                      </p>
                      <Button 
                        onClick={() => {
                          setFilters([]);
                          setSearchCriteria({});
                        }}
                        variant="outline"
                        className="border-primary text-primary shadow-hover"
                      >
                        Cancella tutti i filtri
                      </Button>
                    </div>
                  )}
                </div>
              )}
              
              {/* Map Column or Full Width Map */}
              <div className={view === 'list' ? 'w-full lg:w-2/5 h-full sticky top-32' : 'w-full'}>
                <div className="bg-white rounded-xl overflow-hidden shadow-md border border-neutral-200">
                  <div className={`map-container relative ${view === 'map' ? 'h-[70vh]' : ''}`}>
                    <Map 
                      center={
                        searchCriteria.latitude && searchCriteria.longitude 
                          ? { lat: searchCriteria.latitude, lng: searchCriteria.longitude }
                          : { lat: 41.9028, lng: 12.4964 } // Default Roma
                      }
                      zoom={12}
                      markers={mapMarkers}
                      className="w-full h-full"
                      showCluster={true}
                    />
                  </div>
                  
                  {view === 'list' && (
                    <div className="p-4 border-t border-neutral-200">
                      <h3 className="font-montserrat font-semibold mb-3">Zone popolari a Roma</h3>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" className="bg-neutral-100 hover:bg-primary hover:text-white text-neutral-700 rounded-full text-sm transition-colors">
                          Centro
                        </Button>
                        <Button variant="outline" className="bg-neutral-100 hover:bg-primary hover:text-white text-neutral-700 rounded-full text-sm transition-colors">
                          Tiburtina
                        </Button>
                        <Button variant="outline" className="bg-neutral-100 hover:bg-primary hover:text-white text-neutral-700 rounded-full text-sm transition-colors">
                          San Lorenzo
                        </Button>
                        <Button variant="outline" className="bg-neutral-100 hover:bg-primary hover:text-white text-neutral-700 rounded-full text-sm transition-colors">
                          Prati
                        </Button>
                        <Button variant="outline" className="bg-neutral-100 hover:bg-primary hover:text-white text-neutral-700 rounded-full text-sm transition-colors">
                          Trastevere
                        </Button>
                        <Button variant="outline" className="bg-neutral-100 hover:bg-primary hover:text-white text-neutral-700 rounded-full text-sm transition-colors">
                          EUR
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Save search card - show only in list view */}
                {view === 'list' && (
                  <div className="mt-6 bg-primary/10 rounded-xl p-4 shadow-primary">
                    <div className="flex items-start">
                      <div className="text-primary bg-white rounded-full p-2 mr-3">
                        <Bell className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-montserrat font-semibold">Salva questa ricerca</h3>
                        <p className="text-sm text-neutral-700 mt-1">
                          Ricevi notifiche quando vengono pubblicati nuovi annunci che corrispondono ai tuoi criteri.
                        </p>
                        <Button 
                          onClick={handleSaveSearch}
                          className="mt-3 gradient-primary hover:bg-primary/90 text-white text-sm font-medium shadow-hover"
                        >
                          Attiva notifiche
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
