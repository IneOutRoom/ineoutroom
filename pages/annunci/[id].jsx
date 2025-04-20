import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Navbar } from '../../client/src/components/layout/navbar';
import { Footer } from '../../client/src/components/layout/footer';
import RatingWidget from '../../components/RatingWidget';
import NeighborhoodGuide from '../../components/NeighborhoodGuide';
import MiniMap from '../../components/maps/MiniMap';
import { Button } from '../../client/src/components/ui/button';
import { Badge } from '../../client/src/components/ui/badge';
import { Separator } from '../../client/src/components/ui/separator';
import { 
  MapPin, 
  Euro, 
  Calendar, 
  Square, 
  Users, 
  Home, 
  ArrowLeft,
  Phone,
  Mail,
  Share2,
  Heart,
  Building
} from 'lucide-react';
import SEO from '../components/SEO';

export default function ListingDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchListing = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "listings", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setListing({
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate()
          });
        } else {
          setError("Annuncio non trovato");
        }
      } catch (err) {
        console.error("Errore nel caricamento dell'annuncio:", err);
        setError("Si è verificato un errore nel caricamento dell'annuncio");
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  // Helper per tradurre il tipo di proprietà
  const getPropertyTypeLabel = (type) => {
    switch (type) {
      case 'stanza_singola': return 'Stanza singola';
      case 'stanza_doppia': return 'Stanza doppia';
      case 'monolocale': return 'Monolocale';
      case 'bilocale': return 'Bilocale';
      default: return type;
    }
  };

  // Helper per tradurre i servizi
  const getFeatureLabel = (feature) => {
    switch (feature) {
      case 'wifi': return 'Wi-Fi';
      case 'lavatrice': return 'Lavatrice';
      case 'lavastoviglie': return 'Lavastoviglie';
      case 'aria_condizionata': return 'Aria condizionata';
      case 'riscaldamento': return 'Riscaldamento';
      case 'balcone': return 'Balcone';
      case 'terrazza': return 'Terrazza';
      case 'giardino': return 'Giardino';
      case 'parcheggio': return 'Parcheggio';
      case 'ascensore': return 'Ascensore';
      case 'arredato': return 'Arredato';
      case 'animali_ammessi': return 'Animali ammessi';
      case 'fumatori_ammessi': return 'Fumatori ammessi';
      case 'vista_mare': return 'Vista mare';
      case 'vicino_trasporti': return 'Vicino ai trasporti';
      case 'incluse_utenze': return 'Utenze incluse';
      case 'cucina_condivisa': return 'Cucina condivisa';
      default: return feature;
    }
  };

  // Determina colore in base alla città
  const getCityColor = (city) => {
    const cityColors = {
      'Milano': 'from-blue-600 to-blue-800',
      'Roma': 'from-amber-600 to-red-800',
      'Firenze': 'from-purple-600 to-purple-800',
      'Torino': 'from-slate-600 to-slate-800',
      'Madrid': 'from-red-600 to-red-800',
      'Barcellona': 'from-orange-600 to-red-700',
      'Valencia': 'from-amber-500 to-orange-700',
      'Siviglia': 'from-green-600 to-green-800'
    };
    
    return cityColors[city] || 'from-gray-600 to-gray-800';
  };

  // Se il contenuto è in caricamento, mostra uno spinner
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg">Caricamento annuncio...</p>
        </div>
        <Footer />
      </>
    );
  }

  // Se c'è un errore, mostra il messaggio di errore
  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <div className="text-red-500 text-xl mb-4">
            {error}
          </div>
          <Button asChild>
            <Link href="/search">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Torna alla ricerca
            </Link>
          </Button>
        </div>
        <Footer />
      </>
    );
  }

  // Se l'annuncio non esiste, mostra un messaggio
  if (!listing) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <div className="text-xl mb-4">
            Annuncio non trovato
          </div>
          <Button asChild>
            <Link href="/search">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Torna alla ricerca
            </Link>
          </Button>
        </div>
        <Footer />
      </>
    );
  }

  // Componente principale con i dettagli dell'annuncio
  return (
    <>
      <SEO
        title={`${listing.title} a ${listing.city} | In&Out Room`}
        description={listing.description?.substring(0, 160) || `${getPropertyTypeLabel(listing.propertyType)} in affitto a ${listing.city}, ${listing.zone || ''}. ${listing.squareMeters}m², €${listing.price}/mese.`}
        keywords={`affitto, ${listing.city.toLowerCase()}, ${listing.propertyType}, alloggio, stanza, ${listing.zone?.toLowerCase() || ''}`}
        ogImage={listing.imageURL || listing.photos?.[0] || "/default-property.jpg"}
        ogType="website"
        canonical={`/annunci/${id}`}
      />

      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-grow">
          {/* Back button */}
          <div className="container mx-auto px-4 py-4">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Torna indietro
            </Button>
          </div>
          
          {/* Hero Section with Image */}
          <section className="relative">
            <div className={`w-full h-64 md:h-96 bg-gradient-to-r ${getCityColor(listing.city)}`}>
              {listing.imageURL || listing.photos?.[0] ? (
                <Image
                  src={listing.imageURL || listing.photos[0]}
                  alt={listing.title}
                  fill
                  className="object-cover opacity-70"
                  priority
                />
              ) : (
                <div className="absolute inset-0 opacity-20 bg-center bg-cover mix-blend-overlay"
                     style={{ backgroundImage: `url('/images/pattern-${listing.city.toLowerCase()}.svg')` }} />
              )}
              
              <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/70 to-transparent">
                <div className="container mx-auto">
                  <Badge className="mb-2">
                    {getPropertyTypeLabel(listing.propertyType)}
                  </Badge>
                  <h1 className="text-2xl md:text-4xl font-bold text-white drop-shadow-md mb-2">
                    {listing.title}
                  </h1>
                  <div className="flex items-center text-white/90">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{listing.city}{listing.zone ? `, ${listing.zone}` : ''}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          {/* Content Section */}
          <section className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Price and Key Info */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center text-2xl font-bold text-primary">
                    <Euro className="h-6 w-6 mr-1" />
                    <span>{listing.price}</span>
                    <span className="text-sm font-normal text-muted-foreground ml-1">/mese</span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center">
                      <Square className="h-4 w-4 mr-1" />
                      <span>{listing.squareMeters} m²</span>
                    </div>
                    
                    {listing.rooms && (
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-1" />
                        <span>{listing.rooms} {listing.rooms === 1 ? 'stanza' : 'stanze'}</span>
                      </div>
                    )}
                    
                    {listing.maxGuests && (
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        <span>Max {listing.maxGuests} {listing.maxGuests === 1 ? 'persona' : 'persone'}</span>
                      </div>
                    )}
                    
                    {listing.createdAt && (
                      <div className="flex items-center text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>Pubblicato il {listing.createdAt.toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Description */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Descrizione</h2>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {listing.description || "Nessuna descrizione disponibile."}
                  </p>
                </div>
                
                {/* Features/Services */}
                {listing.features && listing.features.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Servizi</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {listing.features.map((feature, index) => (
                        <div key={index} className="flex items-center p-2 rounded-md border">
                          <span className="text-sm">{getFeatureLabel(feature)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Rating Widget */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Valutazione dell'alloggio</h2>
                  <RatingWidget listingId={id} />
                </div>
                
                {/* House Rules */}
                {listing.rules && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Regole della casa</h2>
                    <p className="text-muted-foreground whitespace-pre-line">
                      {listing.rules}
                    </p>
                  </div>
                )}
                
                {/* Neighborhood Guide */}
                <NeighborhoodGuide listing={listing} />
              </div>
              
              {/* Sidebar */}
              <div className="space-y-6">
                {/* Contact Card */}
                <div className="p-4 border rounded-lg shadow-sm">
                  <h2 className="text-lg font-semibold mb-4">Contatta l'inserzionista</h2>
                  
                  <div className="space-y-4">
                    <Button className="w-full">
                      <Mail className="mr-2 h-4 w-4" />
                      Invia messaggio
                    </Button>
                    
                    <Button variant="outline" className="w-full">
                      <Phone className="mr-2 h-4 w-4" />
                      Richiedi il numero
                    </Button>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="flex justify-between">
                    <Button variant="ghost" size="sm">
                      <Share2 className="mr-2 h-4 w-4" />
                      Condividi
                    </Button>
                    
                    <Button variant="ghost" size="sm">
                      <Heart className="mr-2 h-4 w-4" />
                      Salva
                    </Button>
                  </div>
                </div>
                
                {/* Map Preview */}
                <div className="border rounded-lg overflow-hidden">
                  <h2 className="text-lg font-semibold p-4">Posizione</h2>
                  <div className="h-64">
                    {listing.lat && listing.lng ? (
                      <MiniMap 
                        lat={listing.lat} 
                        lng={listing.lng} 
                        title={listing.title}
                      />
                    ) : (
                      <div className="h-full bg-gray-200 flex items-center justify-center">
                        <p className="text-center text-muted-foreground p-4">
                          {listing.isDemo 
                            ? "Mappa non disponibile per annunci demo" 
                            : `${listing.city}${listing.zone ? `, ${listing.zone}` : ''}`}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
}