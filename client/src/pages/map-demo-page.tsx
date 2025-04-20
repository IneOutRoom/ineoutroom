import React, { useState } from 'react';
import { Link } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import GoogleMap from '@/components/maps/GoogleMap';
import StreetView from '@/components/maps/StreetView';
import AddressAutocomplete from '@/components/maps/AddressAutocomplete';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export default function MapDemoPage() {
  // Stato per memorizzare la posizione selezionata
  const [selectedLocation, setSelectedLocation] = useState({
    lat: 45.4642, // Milano
    lng: 9.1900
  });
  
  // Stato per memorizzare i markers
  const [markers, setMarkers] = useState([
    {
      id: '1',
      position: { lat: 45.4642, lng: 9.1900 },
      title: 'Milano',
      description: 'La bellissima città di Milano'
    }
  ]);
  
  // Funzione per gestire il click sulla mappa
  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      
      // Aggiunge un marker al punto cliccato
      const newMarker = {
        id: `marker-${Date.now()}`,
        position: { lat, lng },
        title: `Posizione (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        description: 'Marker inserito manualmente'
      };
      
      setMarkers([...markers, newMarker]);
      
      // Aggiorna la posizione selezionata per lo street view
      setSelectedLocation({ lat, lng });
    }
  };
  
  // Funzione per gestire la selezione di un indirizzo dall'autocomplete
  const handleAddressSelect = (address: any) => {
    setSelectedLocation({
      lat: address.lat,
      lng: address.lng
    });
    
    // Aggiungi un marker per l'indirizzo selezionato
    const newMarker = {
      id: `address-${Date.now()}`,
      position: { lat: address.lat, lng: address.lng },
      title: address.full,
      description: `${address.street || ''} ${address.streetNumber || ''}, ${address.city || ''}`
    };
    
    setMarkers([...markers, newMarker]);
  };
  
  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <Link href="/">
          <Button variant="outline" className="flex items-center gap-2">
            <Home size={18} />
            <span>Torna alla Home</span>
          </Button>
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-4 text-center text-purple-800">
        In&Out Maps - Visualizzazione Immobili
      </h1>
      <p className="text-lg text-center mb-8 text-gray-600">
        Esplora la tua prossima casa con la nostra integrazione avanzata di mappe e Street View
      </p>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Cerca Indirizzo</CardTitle>
            <CardDescription>
              Inserisci un indirizzo per visualizzarlo sulla mappa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <AddressAutocomplete 
                placeholder="Inserisci un indirizzo (es. Via Roma 1, Milano)"
                onAddressSelect={handleAddressSelect}
                country="it" // limita ricerca all'Italia
              />
              <p className="text-sm text-muted-foreground">
                Oppure clicca direttamente sulla mappa per aggiungere un marker in quel punto
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="map" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="map">Mappa</TabsTrigger>
            <TabsTrigger value="streetview">Street View</TabsTrigger>
            <TabsTrigger value="both">Vista Combinata</TabsTrigger>
          </TabsList>
          
          {/* Vista Mappa */}
          <TabsContent value="map">
            <Card>
              <CardHeader>
                <CardTitle>Google Maps</CardTitle>
                <CardDescription>
                  Visualizza e interagisci con la mappa. Clicca per aggiungere marker.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GoogleMap 
                  center={selectedLocation}
                  zoom={15}
                  markers={markers}
                  onClick={handleMapClick}
                  onMarkerClick={(marker) => {
                    setSelectedLocation(marker.position);
                  }}
                />
                <div className="mt-4">
                  <h3 className="font-medium text-sm">Coordinate Selezionate:</h3>
                  <p className="text-sm text-muted-foreground">
                    Lat: {selectedLocation.lat.toFixed(6)}, Lng: {selectedLocation.lng.toFixed(6)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Vista Street View */}
          <TabsContent value="streetview">
            <Card>
              <CardHeader>
                <CardTitle>Street View</CardTitle>
                <CardDescription>
                  Esplora la zona in prima persona con Street View
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StreetView position={selectedLocation} height="500px" />
                <div className="mt-4">
                  <h3 className="font-medium text-sm">Posizione:</h3>
                  <p className="text-sm text-muted-foreground">
                    Lat: {selectedLocation.lat.toFixed(6)}, Lng: {selectedLocation.lng.toFixed(6)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Vista Combinata */}
          <TabsContent value="both">
            <Card>
              <CardHeader>
                <CardTitle>Vista Combinata</CardTitle>
                <CardDescription>
                  Mappa e Street View insieme per un'esperienza completa
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Mappa</h3>
                    <GoogleMap 
                      center={selectedLocation}
                      zoom={15}
                      markers={markers}
                      onClick={handleMapClick}
                      onMarkerClick={(marker) => {
                        setSelectedLocation(marker.position);
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2">Street View</h3>
                    <StreetView position={selectedLocation} height="400px" />
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <h3 className="font-medium text-sm">Coordinate Selezionate:</h3>
                    <p className="text-sm text-muted-foreground">
                      Lat: {selectedLocation.lat.toFixed(6)}, Lng: {selectedLocation.lng.toFixed(6)}
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <Button variant="default" onClick={() => setMarkers([])}>
                      Cancella Tutti i Marker
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <Card>
          <CardHeader>
            <CardTitle>Marker Salvati ({markers.length})</CardTitle>
            <CardDescription>
              Elenco di tutti i marker presenti sulla mappa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {markers.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nessun marker presente. Clicca sulla mappa per aggiungerli.</p>
              ) : (
                markers.map((marker) => (
                  <div key={marker.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50">
                    <div>
                      <h4 className="font-medium">{marker.title}</h4>
                      <p className="text-sm text-muted-foreground">{marker.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Lat: {marker.position.lat.toFixed(6)}, Lng: {marker.position.lng.toFixed(6)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedLocation(marker.position)}
                      >
                        Visualizza
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => {
                          setMarkers(markers.filter(m => m.id !== marker.id));
                        }}
                      >
                        Elimina
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}