// components/NeighborhoodGuide.jsx
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../client/src/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../client/src/components/ui/card';
import { Badge } from '../client/src/components/ui/badge';
import { Loader2, MapPin, Bus, Train, School, Coffee, Store, Utensils, Park, Stethoscope } from 'lucide-react';

const PLACE_TYPES = {
  transport: [
    { id: 'transit_station', label: 'Trasporti pubblici', icon: <Bus className="h-4 w-4" /> },
    { id: 'train_station', label: 'Stazioni ferroviarie', icon: <Train className="h-4 w-4" /> }
  ],
  services: [
    { id: 'school', label: 'Scuole', icon: <School className="h-4 w-4" /> },
    { id: 'restaurant', label: 'Ristoranti', icon: <Utensils className="h-4 w-4" /> },
    { id: 'cafe', label: 'Caffè', icon: <Coffee className="h-4 w-4" /> },
    { id: 'supermarket', label: 'Supermercati', icon: <Store className="h-4 w-4" /> },
    { id: 'park', label: 'Parchi', icon: <Park className="h-4 w-4" /> },
    { id: 'hospital', label: 'Ospedali', icon: <Stethoscope className="h-4 w-4" /> }
  ]
};

export default function NeighborhoodGuide({ listing }) {
  const [placesData, setPlacesData] = useState({
    transport: [],
    services: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("transport");

  useEffect(() => {
    // Se non abbiamo coordinate o è un annuncio demo, non carichiamo i dati
    if (!listing.lat || !listing.lng || listing.isDemo) {
      setLoading(false);
      return;
    }
    
    // Funzione per caricare i luoghi nelle vicinanze
    const fetchNearbyPlaces = async (placeType) => {
      // Usa l'API di Google Places per trovare luoghi nelle vicinanze
      if (!window.google || !window.google.maps || !window.google.maps.places) {
        // Aspetta che l'API sia caricata prima di procedere
        return [];
      }
      
      const location = new window.google.maps.LatLng(listing.lat, listing.lng);
      const service = new window.google.maps.places.PlacesService(document.createElement('div'));
      
      return new Promise((resolve, reject) => {
        service.nearbySearch({
          location,
          radius: 1000, // 1km di raggio
          type: placeType
        }, (results, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            // Estrai solo i dati necessari
            const places = results.map(place => ({
              id: place.place_id,
              name: place.name,
              vicinity: place.vicinity,
              rating: place.rating,
              distance: calculateDistance(
                listing.lat, 
                listing.lng, 
                place.geometry.location.lat(), 
                place.geometry.location.lng()
              )
            }));
            
            // Ordina per distanza
            places.sort((a, b) => a.distance - b.distance);
            
            // Limita a 5 risultati
            resolve(places.slice(0, 5));
          } else {
            console.warn(`Errore nel caricamento di ${placeType}:`, status);
            resolve([]);
          }
        });
      });
    };
    
    // Funzione per calcolare la distanza tra due coordinate (formula dell'emisenoverso)
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // Raggio della Terra in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const d = R * c; // Distanza in km
      return d;
    };
    
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Verifica se le API di Google sono caricate
        if (!window.google || !window.google.maps) {
          // Attendiamo fino a 5 secondi per il caricamento delle API
          const waitForGoogleMaps = () => {
            return new Promise((resolve) => {
              const checkGoogleMaps = setInterval(() => {
                if (window.google && window.google.maps && window.google.maps.places) {
                  clearInterval(checkGoogleMaps);
                  resolve(true);
                }
              }, 200);
              
              // Timeout dopo 5 secondi
              setTimeout(() => {
                clearInterval(checkGoogleMaps);
                resolve(false);
              }, 5000);
            });
          };
          
          const apiLoaded = await waitForGoogleMaps();
          if (!apiLoaded) {
            throw new Error("Google Maps API non disponibile");
          }
        }
        
        // Carica dati per i trasporti
        const transportPromises = PLACE_TYPES.transport.map(type => 
          fetchNearbyPlaces(type.id).then(places => ({
            type: type.id,
            label: type.label,
            icon: type.icon,
            places
          }))
        );
        
        // Carica dati per i servizi
        const servicesPromises = PLACE_TYPES.services.map(type => 
          fetchNearbyPlaces(type.id).then(places => ({
            type: type.id,
            label: type.label,
            icon: type.icon,
            places
          }))
        );
        
        // Attendi tutti i risultati
        const [transportResults, servicesResults] = await Promise.all([
          Promise.all(transportPromises),
          Promise.all(servicesPromises)
        ]);
        
        // Aggiorna lo stato con i dati
        setPlacesData({
          transport: transportResults.filter(result => result.places.length > 0),
          services: servicesResults.filter(result => result.places.length > 0)
        });
      } catch (err) {
        console.error("Errore nel caricamento dei dati del quartiere:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    // Avvia il caricamento
    loadData();
  }, [listing.lat, listing.lng, listing.isDemo]);

  // Se non ci sono coordinate o è un annuncio demo, non mostrare nulla
  if (!listing.lat || !listing.lng || listing.isDemo) {
    return null;
  }

  // Se è in caricamento, mostra un indicatore
  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Il quartiere</h2>
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // Se c'è un errore, mostra un messaggio
  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Il quartiere</h2>
        <Card>
          <CardContent className="p-4">
            <p className="text-muted-foreground">
              Non è possibile caricare le informazioni sul quartiere al momento.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Se non ci sono dati in nessuna categoria, mostra un messaggio
  const hasTransportData = placesData.transport.some(type => type.places.length > 0);
  const hasServicesData = placesData.services.some(type => type.places.length > 0);
  
  if (!hasTransportData && !hasServicesData) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Il quartiere</h2>
        <Card>
          <CardContent className="p-4">
            <p className="text-muted-foreground">
              Non sono disponibili informazioni dettagliate sul quartiere per questo annuncio.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Il quartiere</h2>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="transport" disabled={!hasTransportData}>
            Trasporti
          </TabsTrigger>
          <TabsTrigger value="services" disabled={!hasServicesData}>
            Servizi
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="transport" className="mt-4">
          {placesData.transport.map(typeData => (
            <div key={typeData.type} className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                {typeData.icon}
                <h3 className="font-medium">{typeData.label}</h3>
              </div>
              
              <div className="space-y-2">
                {typeData.places.map(place => (
                  <Card key={place.id}>
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{place.name}</h4>
                          <p className="text-sm text-muted-foreground">{place.vicinity}</p>
                        </div>
                        <Badge variant="outline">
                          {place.distance < 1 
                            ? `${Math.round(place.distance * 1000)} m` 
                            : `${place.distance.toFixed(1)} km`}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </TabsContent>
        
        <TabsContent value="services" className="mt-4">
          {placesData.services.map(typeData => (
            <div key={typeData.type} className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                {typeData.icon}
                <h3 className="font-medium">{typeData.label}</h3>
              </div>
              
              <div className="space-y-2">
                {typeData.places.map(place => (
                  <Card key={place.id}>
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{place.name}</h4>
                          <p className="text-sm text-muted-foreground">{place.vicinity}</p>
                          
                          {place.rating && (
                            <div className="flex items-center mt-1">
                              <div className="flex">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <svg 
                                    key={i}
                                    className={`h-3.5 w-3.5 ${i < Math.round(place.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                                    xmlns="http://www.w3.org/2000/svg" 
                                    viewBox="0 0 20 20" 
                                    fill="currentColor"
                                  >
                                    <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
                                  </svg>
                                ))}
                              </div>
                              <span className="text-xs ml-1 text-muted-foreground">
                                {place.rating.toFixed(1)}
                              </span>
                            </div>
                          )}
                        </div>
                        <Badge variant="outline">
                          {place.distance < 1 
                            ? `${Math.round(place.distance * 1000)} m` 
                            : `${place.distance.toFixed(1)} km`}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}