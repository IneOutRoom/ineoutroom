import React, { useState } from 'react';
import { DynamicGoogleMap } from '@/components/maps/DynamicGoogleMap';
import { MapMarker } from '@/components/maps/GoogleMapComponent';
import { AddressAutocompleteInput, AddressResult } from '@/components/maps/AddressAutocompleteInput';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Info, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export default function MapsExamplePage() {
  // Stati per la gestione della mappa
  const [center, setCenter] = useState<google.maps.LatLngLiteral>({ lat: 45.4642, lng: 9.1900 }); // Default: Milano
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<AddressResult | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Toast per notifiche
  const { toast } = useToast();

  // Gestisce la selezione di un indirizzo dall'autocompletamento
  const handleAddressSelect = (result: AddressResult) => {
    setSelectedAddress(result);
    setCenter(result.coordinates);
    
    // Crea un nuovo marker per l'indirizzo selezionato
    const newMarker: MapMarker = {
      id: Date.now(), // ID univoco basato sul timestamp
      position: result.coordinates,
      title: result.address,
      content: (
        <div className="p-2 max-w-[250px]">
          <h3 className="font-semibold mb-1">{result.address}</h3>
          <div className="text-xs text-muted-foreground mb-2">
            {result.city && <span>{result.city}, </span>}
            {result.country && <span>{result.country}</span>}
            {result.postalCode && <span> ({result.postalCode})</span>}
          </div>
          <Button size="sm" variant="outline" className="w-full mt-2">
            <Info className="h-4 w-4 mr-2" />
            Dettagli
          </Button>
        </div>
      ),
      icon: {
        url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
      }
    };
    
    // Aggiunge il nuovo marker alla lista
    setMarkers(prev => [...prev, newMarker]);
    
    // Notifica l'utente
    toast({
      title: "Posizione aggiunta",
      description: `${result.address} è stata aggiunta alla mappa`,
    });
  };

  // Gestisce il click sulla mappa
  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    
    const clickedPosition = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    };
    
    // Aggiunge un marker alla posizione cliccata
    const newMarker: MapMarker = {
      id: Date.now(),
      position: clickedPosition,
      title: `Posizione (${clickedPosition.lat.toFixed(4)}, ${clickedPosition.lng.toFixed(4)})`,
      content: (
        <div className="p-2 max-w-[250px]">
          <h3 className="font-semibold mb-1">Posizione selezionata</h3>
          <p className="text-xs mb-2">
            Lat: {clickedPosition.lat.toFixed(6)}<br />
            Lng: {clickedPosition.lng.toFixed(6)}
          </p>
          <Button size="sm" variant="outline" className="w-full mt-2">
            <MapPin className="h-4 w-4 mr-2" />
            Usa questa posizione
          </Button>
        </div>
      ),
      icon: {
        url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
      }
    };
    
    setMarkers(prev => [...prev, newMarker]);
  };

  // Gestisce il click su un marker
  const handleMarkerClick = (marker: MapMarker) => {
    toast({
      title: "Marker selezionato",
      description: marker.title || "Posizione senza titolo",
    });
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-2">Esempio di integrazione Google Maps</h1>
      <p className="text-muted-foreground mb-8">
        Questa pagina dimostra l'integrazione di Google Maps con React, 
        incluso l'autocompletamento degli indirizzi e la gestione dei marker.
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonna di ricerca */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Cerca indirizzo</CardTitle>
            <CardDescription>
              Cerca un indirizzo o seleziona un punto sulla mappa
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <AddressAutocompleteInput
              onAddressSelect={handleAddressSelect}
              placeholder="Inserisci un indirizzo..."
              className="mb-4"
              countryRestrictions={['it', 'fr', 'de', 'es']}
            />
            
            {selectedAddress && (
              <div className="mt-4 p-3 bg-secondary/50 rounded-md">
                <h3 className="font-semibold mb-2">Indirizzo selezionato</h3>
                <p className="text-sm mb-1">{selectedAddress.address}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedAddress.city && (
                    <Badge variant="outline" className="text-xs">
                      <MapPin className="h-3 w-3 mr-1" />
                      {selectedAddress.city}
                    </Badge>
                  )}
                  {selectedAddress.postalCode && (
                    <Badge variant="outline" className="text-xs">
                      {selectedAddress.postalCode}
                    </Badge>
                  )}
                  {selectedAddress.country && (
                    <Badge variant="outline" className="text-xs">
                      {selectedAddress.country}
                    </Badge>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Latitudine</p>
                    <p className="text-sm font-mono">
                      {selectedAddress.coordinates.lat.toFixed(6)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Longitudine</p>
                    <p className="text-sm font-mono">
                      {selectedAddress.coordinates.lng.toFixed(6)}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-4">
              <h3 className="text-sm font-semibold mb-2">Filtra marker</h3>
              <div className="flex space-x-2">
                <Input
                  placeholder="Cerca marker..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline" onClick={() => setSearchQuery('')}>
                  Reset
                </Button>
              </div>
            </div>
              
            {markers.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold mb-2">Marker sulla mappa ({markers.length})</h3>
                <ul className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                  {markers
                    .filter(marker => marker.title?.toLowerCase().includes(searchQuery.toLowerCase()) || !searchQuery)
                    .map(marker => (
                      <li 
                        key={`list-marker-${marker.id}`}
                        className="p-2 rounded border hover:bg-secondary/50 cursor-pointer transition-colors"
                        onClick={() => {
                          setCenter(marker.position);
                          handleMarkerClick(marker);
                        }}
                      >
                        <div className="flex items-start">
                          <div className="h-6 w-6 flex-shrink-0 mr-2">
                            {marker.icon && typeof marker.icon === 'object' && 'url' in marker.icon ? (
                              <img src={marker.icon.url} alt="Marker" className="h-6 w-6" />
                            ) : (
                              <MapPin className="h-6 w-6 text-primary" />
                            )}
                          </div>
                          <div className="flex-grow">
                            <p className="text-sm font-medium line-clamp-1">{marker.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {marker.position.lat.toFixed(4)}, {marker.position.lng.toFixed(4)}
                            </p>
                          </div>
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between border-t pt-4">
            <Button variant="outline" onClick={() => setMarkers([])}>
              Pulisci marker
            </Button>
            <Button onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    const userPosition = {
                      lat: position.coords.latitude,
                      lng: position.coords.longitude
                    };
                    setCenter(userPosition);
                    setMarkers(prev => [...prev, {
                      id: Date.now(),
                      position: userPosition,
                      title: 'La tua posizione',
                      content: (
                        <div className="p-2">
                          <h3 className="font-semibold">La tua posizione</h3>
                          <Button size="sm" className="mt-2">Dettagli</Button>
                        </div>
                      ),
                      icon: {
                        url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
                      }
                    }]);
                    toast({
                      title: "Posizione rilevata",
                      description: "La tua posizione è stata aggiunta alla mappa",
                    });
                  },
                  (error) => {
                    toast({
                      title: "Errore di localizzazione",
                      description: `Impossibile rilevare la posizione: ${error.message}`,
                      variant: "destructive"
                    });
                  }
                );
              } else {
                toast({
                  title: "Geolocalizzazione non supportata",
                  description: "Il tuo browser non supporta la geolocalizzazione",
                  variant: "destructive"
                });
              }
            }}>
              <Navigation className="h-4 w-4 mr-2" />
              Usa posizione attuale
            </Button>
          </CardFooter>
        </Card>
        
        {/* Colonna della mappa */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Mappa interattiva</CardTitle>
            <CardDescription>
              Clicca sulla mappa per aggiungere un marker o cerca un indirizzo
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="h-[600px] w-full">
              <DynamicGoogleMap
                center={center}
                zoom={12}
                markers={markers}
                onClick={handleMapClick}
                onMarkerClick={handleMarkerClick}
                showInfoWindowOnHover={true}
                options={{
                  mapTypeControl: true,
                  fullscreenControl: true,
                  streetViewControl: true,
                }}
              />
            </div>
          </CardContent>
          
          <CardFooter className="mt-4">
            <div className="text-sm text-muted-foreground">
              <p>
                Puoi aggiungere marker cliccando sulla mappa o cercando un indirizzo.
                I marker mostrano informazioni quando ci passi sopra con il mouse.
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}