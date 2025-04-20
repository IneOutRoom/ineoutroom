import { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { AirbnbStyleMap } from '@/components/maps/AirbnbStyleMap';

interface Property {
  id: number;
  title: string;
  price: number;
  city: string;
  zone?: string;
  address: string;
  images?: string[];
  photos?: string[];
  latitude: number;
  longitude: number;
  propertyType: string;
  createdAt: string;
  features: any;
}

interface PropertyMapPageProps {
  properties?: Property[];
  initialCenter?: { lat: number; lng: number };
}

export default function PropertyMapPage() {
  const [location, setLocation] = useLocation();
  const [, params] = useRoute('/property-map/:id');
  const [, params2] = useRoute('/property-map');
  
  // Stato per i parametri di ricerca (bounds)
  const [searchBounds, setSearchBounds] = useState<{
    north: number;
    south: number;
    east: number;
    west: number;
  } | null>(null);
  
  // Query per ottenere le proprietà in base ai parametri della mappa
  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: ['/api/properties/map', searchBounds],
    queryFn: async () => {
      const queryParams = searchBounds 
        ? { bounds: searchBounds }
        : {};
        
      const res = await apiRequest('POST', '/api/properties/map', queryParams);
      return await res.json();
    },
  });
  
  // Gestisce lo spostamento della mappa
  const handleMapMoved = (bounds: any) => {
    setSearchBounds({
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      west: bounds.getWest()
    });
  };

  // Determina il centro iniziale della mappa
  const getInitialCenter = () => {
    // Se stiamo visualizzando una singola proprietà
    if (params?.id) {
      const property = properties?.find(p => p.id === parseInt(params.id));
      if (property && property.latitude && property.longitude) {
        return { lat: property.latitude, lng: property.longitude };
      }
    }
    
    // Altrimenti, usa un centro predefinito (Roma)
    return { lat: 41.9028, lng: 12.4964 };
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-white shadow-sm z-10 relative border-b border-neutral-200">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation('/search')}
              className="p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold text-[#333]">Esplora alloggi sulla mappa</h1>
          </div>
          
          {/* Badge con il numero di proprietà */}
          {!isLoading && properties && (
            <div className="bg-[#6a0dad] text-white rounded-full px-3 py-1 text-sm">
              {properties.length} alloggi
            </div>
          )}
        </div>
      </header>
      
      <main className="flex-grow relative">
        {isLoading && !properties ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-20">
            <div className="flex flex-col items-center">
              <Loader2 className="h-12 w-12 text-[#6a0dad] animate-spin mb-4" />
              <p className="text-[#333] font-medium">Caricamento della mappa...</p>
            </div>
          </div>
        ) : (
          <AirbnbStyleMap
            properties={properties || []}
            initialCenter={getInitialCenter()}
            initialZoom={13}
            onMapMoved={handleMapMoved}
            loading={isLoading}
          />
        )}
      </main>
    </div>
  );
}