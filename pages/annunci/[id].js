import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../../client/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../client/src/components/ui/card';
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
  Wind 
} from 'lucide-react';
import { Badge } from '../../client/src/components/ui/badge';
import { Avatar, AvatarFallback } from '../../client/src/components/ui/avatar';
import { ReviewList } from '../../client/src/components/reviews/ReviewList';
import { SocialShare } from '../../client/src/components/social/SocialShare';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Separator } from '../../client/src/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../client/src/components/ui/tabs';
import { SimilarProperties } from '../../client/src/components/recommendations/SimilarProperties';
import { useAuth } from '../../client/src/hooks/use-auth';
import { usePropertyInteractions } from '../../client/src/hooks/use-property-interactions';
import GoogleMap from '../../client/src/components/maps/GoogleMap';
import StreetView from '../../client/src/components/maps/StreetView';
import SEO from '../components/SEO';
import { 
  generateOrganizationSchema, 
  generateWebPageSchema,
  generateRentalSchema 
} from '../../client/src/components/seo/SchemaGenerator';

// Mappa dei tipi di proprietà in italiano
const propertyTypeMap = {
  stanza_singola: 'Stanza singola',
  stanza_doppia: 'Stanza doppia',
  monolocale: 'Monolocale',
  bilocale: 'Bilocale',
  altro: 'Altra tipologia',
};

export default function PropertyDetailPage({ initialPropertyData, similarProperties }) {
  const router = useRouter();
  const { id } = router.query;
  const propertyId = parseInt(id);
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const { handlePropertyClick, handleSaveProperty, handleContactOwner } = usePropertyInteractions();

  // Se utilizziamo SSG/ISR, possiamo usare useQuery per aggiornamenti client-side
  const { data: property, isLoading } = useQuery({
    queryKey: [`/api/properties/${propertyId}`],
    enabled: !isNaN(propertyId),
    initialData: initialPropertyData,
    onSuccess: (data) => {
      // Registra la visualizzazione della proprietà quando viene caricata
      if (data) {
        handlePropertyClick(data);
      }
    }
  });

  // Gestisce il caso in cui stiamo facendo SSR/ISR e i dati non sono ancora pronti
  if (router.isFallback || isLoading) {
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

  // Meta tags per SEO
  const metaTitle = `${property.title} - In&Out`;
  const metaDescription = property.description ? 
    property.description.substring(0, 150) + (property.description.length > 150 ? '...' : '') : 
    `${propertyTypeMap[property.propertyType]} a ${property.city}`;
  const metaImage = property.photos && property.photos.length > 0 ? 
    property.photos[0] : 
    '/default-property.jpg';

  // Preparazione dei dati schema.org
  const pageSchema = generateWebPageSchema({
    title: metaTitle,
    description: metaDescription,
    url: `https://ineoutroom.eu/annunci/${propertyId}`,
    image: metaImage,
    lastUpdated: new Date().toISOString().split('T')[0]
  });
  
  // Schema per l'annuncio immobiliare
  const rentalSchema = generateRentalSchema({
    id: property.id,
    title: property.title,
    description: property.description || `${propertyTypeMap[property.propertyType]} a ${property.city}`,
    price: property.price,
    availableFrom: property.availableFrom,
    address: property.address || '',
    city: property.city,
    photos: property.photos,
    squareMeters: property.squareMeters,
    propertyType: property.propertyType,
    latitude: property.latitude,
    longitude: property.longitude,
    bedrooms: featuresObj.camere,
    bathrooms: featuresObj.bagni
  });
  
  // Schema organizzazione
  const organizationSchema = generateOrganizationSchema();
  
  // Combina tutti gli schemi
  const jsonLdData = [pageSchema, rentalSchema, organizationSchema];

  return (
    <>
      <SEO
        title={metaTitle}
        description={metaDescription}
        ogImage={metaImage}
        ogType="article"
        ogUrl={`https://ineoutroom.eu/annunci/${propertyId}`}
        jsonLd={jsonLdData}
        canonical={`https://ineoutroom.eu/annunci/${propertyId}`}
      />

      <div className="container mx-auto py-8 px-4 max-w-6xl">
        {/* Breadcrumb e azioni */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <Link href="/search">
              <Button variant="ghost" className="mb-2 pl-0 hover:pl-0 hover:bg-transparent">
                <ChevronLeft className="mr-1 h-4 w-4" />
                Torna alla ricerca
              </Button>
            </Link>
            <div className="flex flex-wrap items-center justify-between">
              <h1 className="text-3xl font-bold">{property.title}</h1>
              <SocialShare compact title={`${property.title} - In&Out`} />
            </div>
            <div className="flex items-center mt-2 text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{property.city}{property.zone ? `, ${property.zone}` : ''}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap mt-4 md:mt-0 gap-2">
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
        
        {/* Immagine e dettagli principali */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2 overflow-hidden rounded-lg">
            {property.photos && property.photos.length > 0 ? (
              <img 
                src={property.photos[0]} 
                alt={property.title} 
                className="w-full h-[400px] object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-[400px] bg-gray-200 flex items-center justify-center rounded-lg">
                <Building className="h-16 w-16 text-gray-400" />
              </div>
            )}
          </div>
          
          <div>
            <Card>
              <CardContent className="p-6">
                <div className="mb-4">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-0 mb-2">
                    {propertyTypeMap[property.propertyType]}
                  </Badge>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold">€{(property.price / 100).toFixed(2)}</span>
                    <span className="text-muted-foreground ml-1">/mese</span>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <CalendarRange className="h-5 w-5 mr-3 text-primary" />
                    <div>
                      <p className="font-medium">Disponibile da</p>
                      <p className="text-sm text-muted-foreground">{availableFromFormatted}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <User2 className="h-5 w-5 mr-3 text-primary" />
                    <div>
                      <p className="font-medium">Host</p>
                      <div className="flex items-center mt-1">
                        <Avatar className="h-6 w-6 mr-2">
                          <AvatarFallback>
                            <User2 className="h-3 w-3" />
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">Host #{property.userId}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={(e) => handleContactOwner(e, property)}
                >
                  Contatta il proprietario
                </Button>
                
                <Button variant="outline" className="w-full mt-2" size="lg">
                  <Bookmark className="mr-2 h-4 w-4" />
                  Salva ricerca
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Dettagli, descrizione, mappa e recensioni */}
        <Tabs defaultValue="details" className="mb-12">
          <TabsList className="mb-4">
            <TabsTrigger value="details">Dettagli</TabsTrigger>
            <TabsTrigger value="map">Mappa</TabsTrigger>
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
          
          <TabsContent value="map">
            <Card>
              <CardHeader>
                <CardTitle>Posizione</CardTitle>
                <CardDescription>
                  {property.address}, {property.city}, {property.country}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {property.latitude && property.longitude ? (
                  <div className="space-y-6">
                    <div className="h-[400px]">
                      <GoogleMap 
                        center={{ lat: property.latitude, lng: property.longitude }} 
                        zoom={15}
                        markers={[
                          {
                            id: `property-${property.id}`,
                            position: { lat: property.latitude, lng: property.longitude },
                            title: property.title,
                            description: property.address
                          }
                        ]}
                        className="rounded-none rounded-b-lg"
                      />
                    </div>
                    
                    <div className="px-6 pb-6">
                      <h3 className="text-lg font-semibold mb-3">Street View</h3>
                      <div className="h-[300px]">
                        <StreetView 
                          position={{ lat: property.latitude, lng: property.longitude }}
                          height="300px"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <div className="mb-4">
                      <MapPin className="h-12 w-12 text-muted-foreground mx-auto" />
                    </div>
                    <p className="text-muted-foreground">
                      Posizione precisa non disponibile per questo annuncio.
                    </p>
                  </div>
                )}
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
        <SimilarProperties propertyId={propertyId} initialProperties={similarProperties} />
      </div>
    </>
  );
}

// Genera i percorsi statici in fase di build
export async function getStaticPaths() {
  try {
    // Recupera gli ID delle proprietà più popolari o in evidenza
    const res = await fetch('http://localhost:5000/api/properties/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        isActive: true,
        limit: 50, // Prendi i primi 50 annunci
      }),
    });

    const properties = await res.json();
    
    // Crea i paths per le pagine statiche
    const paths = properties.map((property) => ({
      params: { id: property.id.toString() },
    }));

    return {
      paths,
      // fallback: true permette di generare pagine non pre-renderizzate on-demand
      fallback: true,
    };
  } catch (error) {
    console.error('Errore durante il recupero delle proprietà:', error);
    return {
      paths: [],
      fallback: true,
    };
  }
}

// Recupera i dati per ogni pagina al momento del build
export async function getStaticProps({ params }) {
  try {
    const { id } = params;
    const propertyId = parseInt(id);

    // Recupera i dati della proprietà
    const propertyRes = await fetch(`http://localhost:5000/api/properties/${propertyId}`);
    const property = await propertyRes.json();

    // Recupera proprietà simili
    const similarRes = await fetch(`http://localhost:5000/api/properties/${propertyId}/similar`);
    const similarProperties = await similarRes.json();

    // Se la proprietà non esiste, restituisci notFound
    if (!property || property.error) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        initialPropertyData: property,
        similarProperties: similarProperties || [],
      },
      // Rigenera la pagina ogni 60 minuti
      revalidate: 3600,
    };
  } catch (error) {
    console.error('Errore durante il recupero dei dati della proprietà:', error);
    return {
      notFound: true,
    };
  }
}