import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Bath, 
  Bookmark, 
  Building, 
  CalendarRange, 
  ChevronLeft, 
  Heart, 
  MapPin, 
  Network,
  PencilLine,
  Ruler, 
  User2, 
  Utensils, 
  Users, 
  Wifi, 
  Wind,
  Camera
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ReviewList } from "@/components/reviews/ReviewList";
import { SocialShare } from "@/components/social/SocialShare";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { propertyTypeEnum } from "@shared/schema";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SimilarProperties } from "@/components/recommendations/SimilarProperties";
import { usePropertyInteractions } from "@/hooks/use-property-interactions";
import { StreetViewPreview } from "@/components/streetview/StreetViewPreview";
import { MapillaryStreetView } from "@/components/streetview/MapillaryStreetView";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { getPlaceholderUrl } from "@/utils/image-optimizer";
import { PropertyGallery } from "@/components/gallery/PropertyGallery";

// Mappa dei tipi di proprietà in italiano
const propertyTypeMap: Record<string, string> = {
  stanza_singola: 'Stanza singola',
  stanza_doppia: 'Stanza doppia',
  monolocale: 'Monolocale',
  bilocale: 'Bilocale',
  altro: 'Altra tipologia',
};

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const propertyId = parseInt(id);
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const { handlePropertyClick, handleSaveProperty, handleContactOwner } = usePropertyInteractions();

  const { data: property, isLoading } = useQuery<any>({
    queryKey: [`/api/properties/${propertyId}`],
    enabled: !isNaN(propertyId),
    onSuccess: (data) => {
      // Registra la visualizzazione della proprietà quando viene caricata
      if (data) {
        handlePropertyClick(data);
      }
    }
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-6xl">
        <div className="flex justify-center my-12">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-6xl">
        <div className="text-center my-12">
          <h1 className="text-2xl font-bold mb-4">Proprietà non trovata</h1>
          <p className="mb-6">La proprietà che stai cercando non esiste o è stata rimossa.</p>
          <Button asChild>
            <Link href="/search">Torna alla ricerca</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Formato data disponibilità
  const availableFromFormatted = property.availableFrom 
    ? format(new Date(property.availableFrom), "d MMMM yyyy", { locale: it })
    : "Disponibile ora";

  // Caratteristiche della proprietà
  const features = [];
  
  if (property.squareMeters) {
    features.push({ icon: <Ruler className="h-5 w-5" />, text: `${property.squareMeters}m²` });
  }
  
  // Estrai le caratteristiche dal campo features (JSON)
  const featuresObj = typeof property.features === 'string' 
    ? JSON.parse(property.features || '{}') 
    : property.features || {};
  
  if (featuresObj.coinquilini) {
    features.push({ icon: <Users className="h-5 w-5" />, text: `${featuresObj.coinquilini} coinquilini` });
  }
  
  if (featuresObj.wifi) {
    features.push({ icon: <Wifi className="h-5 w-5" />, text: 'Wi-Fi' });
  }
  
  if (featuresObj.ariaCondizionata) {
    features.push({ icon: <Wind className="h-5 w-5" />, text: 'Aria condizionata' });
  }
  
  if (featuresObj.bagni) {
    features.push({ icon: <Bath className="h-5 w-5" />, text: `${featuresObj.bagni} ${featuresObj.bagni === 1 ? 'bagno' : 'bagni'}` });
  }
  
  if (featuresObj.cucina) {
    features.push({ icon: <Utensils className="h-5 w-5" />, text: 'Cucina' });
  }
  
  if (featuresObj.balcone) {
    features.push({ icon: <Network className="h-5 w-5" />, text: 'Balcone' });
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Breadcrumb e azioni */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-6">
        <div className="w-full">
          <Link href="/search">
            <Button variant="ghost" className="mb-2 pl-0 hover:pl-0 hover:bg-transparent text-sm">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Torna alla ricerca
            </Button>
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold leading-tight break-words hyphens-auto">{property.title}</h1>
            <SocialShare compact title={`${property.title} - In&Out`} className="self-start mt-1 sm:mt-0" />
          </div>
          <div className="flex items-center mt-2 text-muted-foreground text-sm">
            <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
            <span className="truncate">{property.city}{property.zone ? `, ${property.zone}` : ''}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap mt-4 md:mt-0 gap-2 justify-center sm:justify-start">
          <Button 
            variant="outline" 
            className="flex items-center"
            onClick={(e) => {
              setIsFavorite(!isFavorite);
              handleSaveProperty(e, property);
            }}
          >
            <Heart className={`mr-2 h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
            {isFavorite ? 'Salvato' : 'Salva'}
          </Button>
          
          <SocialShare 
            compact 
            title={`${property.title} - In&Out`} 
            className="hidden sm:inline-flex" 
          />
          
          {user && user.id === property.userId && (
            <Button className="flex items-center">
              <PencilLine className="mr-2 h-4 w-4" />
              Modifica
            </Button>
          )}
        </div>
      </div>
      
      {/* Galleria immagini e dettagli principali */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 md:mb-8">
        <div className="md:col-span-2 overflow-hidden">
          <PropertyGallery 
            images={property.photos || []} 
            alt={property.title}
            className="w-full rounded-lg shadow-sm" 
          />
        </div>
        
        <div>
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="mb-4">
                <Badge variant="outline" className="bg-primary/10 text-primary border-0 mb-2">
                  {propertyTypeMap[property.propertyType as keyof typeof propertyTypeMap]}
                </Badge>
                <div className="flex flex-wrap items-baseline">
                  <span className="text-2xl sm:text-3xl font-bold">€{(property.price / 100).toFixed(2)}</span>
                  <span className="text-muted-foreground ml-1">/mese</span>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <CalendarRange className="h-5 w-5 mr-3 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm sm:text-base">Disponibile da</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">{availableFromFormatted}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <User2 className="h-5 w-5 mr-3 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm sm:text-base">Host</p>
                    <div className="flex items-center mt-1">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarFallback>
                          <User2 className="h-3 w-3" />
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs sm:text-sm">Host #{property.userId}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="grid gap-2">
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={(e) => handleContactOwner(e, property)}
                >
                  Contatta il proprietario
                </Button>
                
                <Button variant="outline" className="w-full" size="default">
                  <Bookmark className="mr-2 h-4 w-4" />
                  Salva ricerca
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Dettagli, descrizione, street view e recensioni */}
      <Tabs defaultValue="details" className="mb-12">
        <TabsList className="mb-4">
          <TabsTrigger value="details">Dettagli</TabsTrigger>
          <TabsTrigger value="street-view">
            <span className="flex items-center">
              <Camera className="mr-2 h-4 w-4" />
              Vista Stradale
            </span>
          </TabsTrigger>
          <TabsTrigger value="reviews">Recensioni</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <Card>
            <CardContent className="p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-4">Caratteristiche</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <div className="bg-primary/10 p-2 rounded mr-3">
                        {feature.icon}
                      </div>
                      <span>{feature.text}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div>
                <h2 className="text-2xl font-bold mb-4">Descrizione</h2>
                <p className="whitespace-pre-line">{property.description}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="street-view">
          <Card>
            <CardContent className="p-6">
              <div className="mb-4">
                <h2 className="text-2xl font-bold">Vista Stradale</h2>
                <p className="text-muted-foreground">
                  Esplora i dintorni di {property.address || `${property.city}${property.zone ? `, ${property.zone}` : ''}`}
                </p>
              </div>
              
              <div className="mt-6">
                {property.latitude && property.longitude ? (
                  <MapillaryStreetView 
                    latitude={property.latitude} 
                    longitude={property.longitude}
                    height={400}
                    className="rounded-lg shadow-md"
                  />
                ) : (
                  <div className="w-full rounded-lg overflow-hidden border border-neutral-200 flex items-center justify-center py-12 bg-neutral-50">
                    <div className="text-center px-4 max-w-md">
                      <div className="w-16 h-16 mx-auto rounded-full bg-neutral-200 flex items-center justify-center mb-3">
                        <MapPin className="h-8 w-8 text-neutral-500" />
                      </div>
                      <h3 className="text-lg font-medium text-neutral-800 mb-1">Coordinate non disponibili</h3>
                      <p className="text-sm text-neutral-600">
                        Non sono disponibili le coordinate geografiche per questa proprietà.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reviews">
          <Card>
            <CardContent className="p-6">
              <ReviewList 
                propertyId={propertyId} 
                isPropertyOwner={user?.id === property.userId} 
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Proprietà simili */}
      <SimilarProperties propertyId={propertyId} />
    </div>
  );
}