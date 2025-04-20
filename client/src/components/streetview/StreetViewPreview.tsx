import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { MapillaryStreetView } from './MapillaryStreetView';

interface StreetViewPreviewProps {
  latitude: number;
  longitude: number;
  address?: string;
  showAsTab?: boolean;
  height?: number;
}

export function StreetViewPreview({
  latitude,
  longitude,
  address,
  showAsTab = true,
  height = 400,
}: StreetViewPreviewProps) {
  
  // Se richiesto come tab, integra in una scheda con tabs
  if (showAsTab) {
    return (
      <Tabs defaultValue="map" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="map">Mappa</TabsTrigger>
          <TabsTrigger value="street-view">Street View</TabsTrigger>
        </TabsList>
        
        {/* Content per la tab della mappa */}
        <TabsContent value="map">
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-lg">Posizione sulla mappa</CardTitle>
              {address && (
                <CardDescription>{address}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="p-0">
              {/* Inseriamo l'iframe con la mappa OpenStreetMap */}
              <div style={{ height: `${height}px` }}>
                <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight={0}
                  marginWidth={0}
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.005},${latitude - 0.005},${longitude + 0.005},${latitude + 0.005}&layer=mapnik&marker=${latitude},${longitude}`}
                  style={{ border: 0 }}
                  title="Mappa della posizione"
                  aria-label={`Mappa della posizione ${address || ''}`}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Content per la tab di Street View */}
        <TabsContent value="street-view">
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-lg">Vista Stradale</CardTitle>
              <CardDescription>
                Esplora l'area intorno a {address || 'questa posizione'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <MapillaryStreetView 
                latitude={latitude}
                longitude={longitude}
                height={height}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    );
  }
  
  // Altrimenti, mostra solo la vista stradale senza tabs
  return (
    <div className="w-full">
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-lg">Vista Stradale</CardTitle>
          {address && (
            <CardDescription>{address}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <MapillaryStreetView 
            latitude={latitude}
            longitude={longitude}
            height={height}
          />
        </CardContent>
      </Card>
    </div>
  );
}

// Componente dedicato al fallback in caso di assenza di immagini
export function StreetViewUnavailable({ message }: { message?: string }) {
  return (
    <div className="w-full rounded-lg overflow-hidden border border-neutral-200 flex items-center justify-center py-10 bg-neutral-50">
      <div className="text-center px-4 max-w-md">
        <div className="w-16 h-16 mx-auto rounded-full bg-neutral-200 flex items-center justify-center mb-3">
          <MapPin className="h-8 w-8 text-neutral-500" />
        </div>
        <h3 className="text-lg font-medium text-neutral-800 mb-1">Vista Stradale non disponibile</h3>
        <p className="text-sm text-neutral-600">
          {message || 'Non sono disponibili immagini Street View per questa posizione. Prova a esplorare altre zone vicine.'}
        </p>
      </div>
    </div>
  );
}