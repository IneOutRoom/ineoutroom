import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Navbar } from '../client/src/components/layout/navbar';
import { Footer } from '../client/src/components/layout/footer';
import InteractiveMap from '../components/maps/InteractiveMap';
import { ListingsGrid } from '../client/src/components/listings/ListingsGrid';
import { Button } from '../client/src/components/ui/button';
import { Separator } from '../client/src/components/ui/separator';
import { 
  Slider,
  SliderTrack,
  SliderRange,
  SliderThumb
} from '../client/src/components/ui/slider';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../client/src/components/ui/select';
import { 
  MapPin, 
  Euro, 
  RefreshCw,
  List,
  Home,
  XCircle
} from 'lucide-react';
import SEO from './components/SEO';

export default function MapPage() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [listingsAll, setListingsAll] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [priceMax, setPriceMax] = useState(2000);
  const [bounds, setBounds] = useState(null);
  const [propertyType, setPropertyType] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedListingId, setSelectedListingId] = useState(null);
  const [error, setError] = useState(null);
  
  // Usa l'effetto solo lato client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Recupera gli annunci da Firestore
  useEffect(() => {
    setLoading(true);
    
    try {
      // Costruisci la query di base
      let q = query(collection(db, "listings"));
      
      // Filtra per tipo se specificato
      if (propertyType) {
        q = query(q, where("propertyType", "==", propertyType));
      }
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (snapshot.empty) {
          // Usa annunci demo se non ci sono annunci reali
          const demoListings = getDemoListings();
          setListingsAll(demoListings);
          setFilteredListings(demoListings);
        } else {
          // Mappa i documenti Firestore in oggetti annuncio
          const allListings = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              title: data.title || "Annuncio senza titolo",
              description: data.description || "",
              city: data.city || "Città sconosciuta",
              zone: data.zone || "",
              country: data.country || "Italia",
              price: data.price || 0,
              squareMeters: data.squareMeters || 0,
              propertyType: data.propertyType || "altro",
              isDemo: false,
              lat: data.lat || null,
              lng: data.lng || null,
              createdAt: data.createdAt?.toDate() || new Date(),
              features: data.features || []
            };
          });
          
          setListingsAll(allListings);
          // Inizialmente, mostra tutti gli annunci
          setFilteredListings(allListings);
        }
        
        setLoading(false);
      }, (err) => {
        console.error("Errore nella query di Firestore:", err);
        setError("Si è verificato un errore nel caricamento degli annunci.");
        setLoading(false);
        
        // In caso di errore, usa annunci demo
        const demoListings = getDemoListings();
        setListingsAll(demoListings);
        setFilteredListings(demoListings);
      });
      
      return () => unsubscribe();
    } catch (err) {
      console.error("Errore nella connessione a Firestore:", err);
      setError("Si è verificato un errore nella connessione al database.");
      setLoading(false);
      
      // In caso di errore, usa annunci demo
      const demoListings = getDemoListings();
      setListingsAll(demoListings);
      setFilteredListings(demoListings);
    }
  }, [propertyType]);

  // Aggiorna i filtri quando cambiano i criteri
  useEffect(() => {
    let result = listingsAll;
    
    // Filtro per prezzo massimo
    result = result.filter(listing => listing.price <= priceMax);
    
    // Filtro per bounds mappa
    if (bounds) {
      result = result.filter(listing => {
        if (!listing.lat || !listing.lng) return false; // Esclude annunci senza coordinate
        
        return (
          listing.lat <= bounds.north &&
          listing.lat >= bounds.south &&
          listing.lng <= bounds.east &&
          listing.lng >= bounds.west
        );
      });
    }
    
    // Filtro per tipo di proprietà
    if (propertyType) {
      result = result.filter(listing => listing.propertyType === propertyType);
    }
    
    setFilteredListings(result);
  }, [priceMax, bounds, listingsAll, propertyType]);

  // Handler per l'aggiornamento dei bounds della mappa
  const handleBoundsChange = useCallback((newBounds) => {
    setBounds(newBounds);
  }, []);

  // Handler per il click su un marker
  const handleMarkerClick = useCallback((listing) => {
    setSelectedListingId(listing.id);
    
    // Scrolla alla posizione dell'annuncio nella lista
    const listingElement = document.getElementById(`listing-${listing.id}`);
    if (listingElement) {
      listingElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Evidenzia brevemente l'elemento
      listingElement.classList.add('highlight-listing');
      setTimeout(() => {
        listingElement.classList.remove('highlight-listing');
      }, 2000);
    }
  }, []);

  // Annunci demo con coordinate
  const getDemoListings = () => {
    return [
      {
        id: "demo1",
        title: "Stanza luminosa a Milano",
        description: "Bellissima stanza in appartamento condiviso, situata nel quartiere Navigli, a pochi passi dai mezzi pubblici.",
        city: "Milano",
        zone: "Navigli",
        country: "Italia",
        price: 500,
        squareMeters: 18,
        propertyType: "stanza_singola",
        isDemo: true,
        lat: 45.4641,
        lng: 9.1919,
        createdAt: new Date(2025, 3, 10),
        features: ["wifi", "balcone", "incluse_utenze"]
      },
      {
        id: "demo2",
        title: "Habitación céntrica en Madrid",
        description: "Bonita habitación en el corazón de Madrid, cerca de Gran Vía y con todas las comodidades.",
        city: "Madrid",
        zone: "Centro",
        country: "Spagna",
        price: 450,
        squareMeters: 15,
        propertyType: "stanza_singola",
        isDemo: true,
        lat: 40.4168,
        lng: -3.7038,
        createdAt: new Date(2025, 3, 12),
        features: ["wifi", "arredato", "lavatrice"]
      },
      {
        id: "demo3",
        title: "Camera accogliente a Roma",
        description: "Camera singola in zona Trastevere, appartamento con due bagni e cucina recentemente rinnovata.",
        city: "Roma",
        zone: "Trastevere",
        country: "Italia",
        price: 400,
        squareMeters: 14,
        propertyType: "stanza_singola",
        isDemo: true,
        lat: 41.9028,
        lng: 12.4964,
        createdAt: new Date(2025, 3, 15),
        features: ["incluse_utenze", "lavatrice", "cucina_condivisa"]
      },
      {
        id: "demo4",
        title: "Habitación con vistas en Barcelona",
        description: "Amplia habitación con vistas al mar, en barrio Barceloneta, ideal para estudiantes o jóvenes profesionales.",
        city: "Barcellona",
        zone: "Barceloneta",
        country: "Spagna",
        price: 480,
        squareMeters: 16,
        propertyType: "stanza_singola",
        isDemo: true,
        lat: 41.3874,
        lng: 2.1686,
        createdAt: new Date(2025, 3, 16),
        features: ["vista_mare", "arredato", "vicino_trasporti"]
      },
      {
        id: "demo5",
        title: "Monolocale nel cuore di Firenze",
        description: "Accogliente monolocale a due passi dal Duomo, completamente arredato e pronto all'uso.",
        city: "Firenze",
        zone: "Centro",
        country: "Italia",
        price: 650,
        squareMeters: 30,
        propertyType: "monolocale",
        isDemo: true,
        lat: 43.7696,
        lng: 11.2558,
        createdAt: new Date(2025, 3, 18),
        features: ["animali_ammessi", "arredato", "wifi"]
      },
      {
        id: "demo6",
        title: "Piso compartido en Valencia",
        description: "Habitación doble en piso compartido cerca de la Ciudad de las Artes y las Ciencias.",
        city: "Valencia",
        zone: "Ciutat de les Arts",
        country: "Spagna",
        price: 350,
        squareMeters: 20,
        propertyType: "stanza_doppia",
        isDemo: true,
        lat: 39.4699,
        lng: -0.3763,
        createdAt: new Date(2025, 3, 19),
        features: ["wifi", "lavastoviglie", "aria_condizionata"]
      },
      {
        id: "demo7",
        title: "Bilocale a Torino",
        description: "Moderno bilocale in zona San Salvario, vicino alle università e alla vita notturna.",
        city: "Torino",
        zone: "San Salvario",
        country: "Italia",
        price: 580,
        squareMeters: 45,
        propertyType: "bilocale",
        isDemo: true,
        lat: 45.0703,
        lng: 7.6869,
        createdAt: new Date(2025, 3, 20),
        features: ["arredato", "lavatrice", "animali_ammessi"]
      },
      {
        id: "demo8",
        title: "Ático en Sevilla",
        description: "Bonito ático con terraza privada en el barrio de Triana, completamente amueblado.",
        city: "Siviglia",
        zone: "Triana",
        country: "Spagna",
        price: 500,
        squareMeters: 40,
        propertyType: "bilocale",
        isDemo: true,
        lat: 37.3891,
        lng: -5.9845,
        createdAt: new Date(2025, 3, 20),
        features: ["terrazza", "arredato", "aria_condizionata"]
      }
    ];
  };

  // Reset di tutti i filtri
  const handleResetFilters = () => {
    setPriceMax(2000);
    setPropertyType("");
    setBounds(null);
  };

  // Non renderizzare nulla lato server
  if (!isClient) {
    return null;
  }

  return (
    <>
      <SEO
        title="Mappa Interattiva | In&Out Room"
        description="Esplora gli annunci di stanze e alloggi in affitto in Europa sulla nostra mappa interattiva. Filtra per prezzo, tipo di proprietà e posizione."
        keywords="mappa, annunci, affitto, stanze, alloggi, ricerca mappa, filtri"
        ogImage="/og-image.jpg"
        ogType="website"
        canonical="/mappa"
      />

      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row items-center justify-between mb-6">
              <h1 className="text-2xl font-bold flex items-center">
                <MapPin className="h-6 w-6 mr-2 text-primary" />
                Mappa Interattiva
              </h1>
              
              <div className="flex items-center space-x-2 mt-3 md:mt-0">
                <Button variant="outline" size="sm" onClick={handleResetFilters}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset filtri
                </Button>
                
                <Button variant="default" size="sm" asChild>
                  <Link href="/search">
                    <List className="h-4 w-4 mr-2" />
                    Vista Lista
                  </Link>
                </Button>
              </div>
            </div>
            
            {/* Filtri */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Filtro prezzo */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                      Prezzo massimo: <span className="text-primary font-semibold">{priceMax}€</span>
                    </label>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 px-2"
                      onClick={() => setPriceMax(2000)}
                    >
                      <XCircle className="h-3 w-3 mr-1" />
                      Reset
                    </Button>
                  </div>
                  <Slider
                    defaultValue={[2000]}
                    value={[priceMax]}
                    max={2000}
                    step={50}
                    onValueChange={(values) => setPriceMax(values[0])}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0€</span>
                    <span>2000€</span>
                  </div>
                </div>
                
                {/* Filtro tipo proprietà */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                      Tipo di proprietà
                    </label>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 px-2"
                      onClick={() => setPropertyType("")}
                      disabled={!propertyType}
                    >
                      <XCircle className="h-3 w-3 mr-1" />
                      Reset
                    </Button>
                  </div>
                  <Select value={propertyType} onValueChange={setPropertyType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Qualsiasi tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Qualsiasi tipo</SelectItem>
                      <SelectItem value="stanza_singola">Stanza singola</SelectItem>
                      <SelectItem value="stanza_doppia">Stanza doppia</SelectItem>
                      <SelectItem value="monolocale">Monolocale</SelectItem>
                      <SelectItem value="bilocale">Bilocale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Statistiche */}
                <div className="flex flex-col justify-center items-center bg-white rounded-md p-3 border">
                  <div className="text-lg font-semibold">
                    {filteredListings.length} {filteredListings.length === 1 ? 'annuncio' : 'annunci'} trovati
                  </div>
                  
                  {bounds && (
                    <div className="text-xs text-muted-foreground mt-1 text-center">
                      Area visibile sulla mappa: {bounds.north.toFixed(2)}, {bounds.west.toFixed(2)} → {bounds.south.toFixed(2)}, {bounds.east.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Mappa e lista */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Mappa interattiva */}
              <div className="lg:col-span-7 xl:col-span-8">
                <div className="h-[600px]">
                  <InteractiveMap 
                    listings={filteredListings}
                    onBoundsChange={handleBoundsChange}
                    onMarkerClick={handleMarkerClick}
                    className="h-full"
                  />
                </div>
              </div>
              
              {/* Lista annunci */}
              <div className="lg:col-span-5 xl:col-span-4">
                <div className="rounded-lg border overflow-hidden h-[600px]">
                  <div className="bg-primary text-primary-foreground p-3">
                    <div className="font-semibold">Risultati della ricerca</div>
                  </div>
                  
                  <div className="overflow-y-auto h-[calc(100%-48px)] bg-gray-50">
                    {loading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                      </div>
                    ) : filteredListings.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                        <Home className="h-12 w-12 text-muted-foreground mb-3" />
                        <h3 className="font-semibold text-lg">Nessun annuncio trovato</h3>
                        <p className="text-muted-foreground mt-1">
                          Prova a modificare i filtri o a esplorare un'altra area sulla mappa
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-4"
                          onClick={handleResetFilters}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Reset filtri
                        </Button>
                      </div>
                    ) : (
                      <div className="p-2">
                        {filteredListings.map((listing, index) => (
                          <div 
                            key={listing.id} 
                            id={`listing-${listing.id}`}
                            className={`bg-white rounded-md overflow-hidden shadow-sm transition-all duration-200 mb-2 hover:shadow-md ${selectedListingId === listing.id ? 'ring-2 ring-primary' : ''}`}
                          >
                            <Link href={listing.isDemo ? "#" : `/annunci/${listing.id}`}>
                              <div className="p-3">
                                <div className="flex justify-between items-start">
                                  <h3 className="font-medium text-sm line-clamp-1">
                                    {listing.title}
                                  </h3>
                                  <div className="flex items-center bg-primary text-white px-2 py-1 rounded text-xs font-bold">
                                    <Euro className="h-3 w-3 mr-1" />
                                    {listing.price}
                                  </div>
                                </div>
                                
                                <div className="flex items-center text-xs text-muted-foreground mt-1">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {listing.city}{listing.zone ? `, ${listing.zone}` : ''}
                                </div>
                                
                                <div className="flex items-center mt-2">
                                  <div className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded mr-2">
                                    {listing.propertyType === 'stanza_singola' ? 'Stanza singola' : 
                                     listing.propertyType === 'stanza_doppia' ? 'Stanza doppia' :
                                     listing.propertyType === 'monolocale' ? 'Monolocale' :
                                     listing.propertyType === 'bilocale' ? 'Bilocale' : 
                                     listing.propertyType}
                                  </div>
                                  <div className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                    {listing.squareMeters} m²
                                  </div>
                                </div>
                              </div>
                            </Link>
                            {index < filteredListings.length - 1 && <Separator />}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
      
      <style jsx global>{`
        .highlight-listing {
          animation: highlight-pulse 2s ease-in-out;
        }
        
        @keyframes highlight-pulse {
          0% { background-color: white; }
          50% { background-color: rgba(106, 13, 173, 0.1); }
          100% { background-color: white; }
        }
      `}</style>
    </>
  );
}