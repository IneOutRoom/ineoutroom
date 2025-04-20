import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { db } from '../../../../firebase';
import { collection, onSnapshot, query, limit, where, orderBy } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { MapPin, Euro, Home, Building, BedSingle, Bed } from 'lucide-react';

/**
 * Componente che visualizza una griglia di annunci immobiliari
 * Se non ci sono annunci reali nel database, mostra annunci demo
 */
export function ListingsGrid({ maxItems = 8 }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    
    try {
      // Query Firestore ottimizzata per gli annunci più recenti
      // Utilizziamo l'indice composto su isActive + createdAt
      // Limitiamo i campi restituiti a quelli essenziali per la visualizzazione delle card
      const q = query(
        collection(db, "listings"),
        where("isActive", "==", true),
        orderBy("createdAt", "desc"),
        limit(maxItems)
      );
      
      // Utilizziamo getDocs invece di onSnapshot per dati che non cambiano frequentemente
      // Per una migliore esperienza utente, potremmo convertire a onSnapshot se necessario
      const fetchListings = async () => {
        try {
          const snapshot = await getDocs(q);
          
          if (snapshot.empty) {
            // Nessun annuncio reale: usa dati demo
            const demoListings = getDemoListings();
            setListings(demoListings);
          } else {
            // Mappa i documenti Firestore in oggetti annuncio
            const realListings = snapshot.docs.map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                title: data.title,
                description: data.description || "",
                city: data.city,
                zone: data.zone || "",
                country: data.country || "Italia",
                price: data.price,
                squareMeters: data.squareMeters,
                propertyType: data.propertyType,
                isDemo: false,
                createdAt: data.createdAt?.toDate() || new Date(),
                features: data.features || []
              };
            });
            setListings(realListings);
          }
        } catch (err) {
          console.error("Errore nella query di Firestore:", err);
          setError(err);
          // In caso di errore, mostra comunque gli annunci demo
          setListings(getDemoListings());
        } finally {
          setLoading(false);
        }
      };
      
      fetchListings();
      
      // Non abbiamo una funzione di cleanup perché non usiamo onSnapshot
      // Se in futuro si decide di usare onSnapshot, ricordare di restituire unsubscribe
    } catch (err) {
      console.error("Errore nella connessione a Firestore:", err);
      setError(err);
      setLoading(false);
      // In caso di errore, mostra comunque gli annunci demo
      setListings(getDemoListings());
    }
  }, [maxItems]);

  // Funzione per generare annunci demo
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
        createdAt: new Date(2025, 3, 20),
        features: ["terrazza", "arredato", "aria_condizionata"]
      }
    ];
  };

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

  // Helper per ottenere l'icona del tipo di proprietà
  const getPropertyTypeIcon = (type) => {
    switch (type) {
      case 'stanza_singola': return <BedSingle className="h-4 w-4" />;
      case 'stanza_doppia': return <Bed className="h-4 w-4" />;
      case 'monolocale': return <Home className="h-4 w-4" />;
      case 'bilocale': 
      default: return <Building className="h-4 w-4" />;
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

  // Generatore di colori per il badge di proprietà
  const getPropertyTypeColor = (type) => {
    switch (type) {
      case 'stanza_singola': return 'bg-blue-500';
      case 'stanza_doppia': return 'bg-purple-500';
      case 'monolocale': return 'bg-green-500';
      case 'bilocale': return 'bg-amber-500';
      default: return 'bg-gray-500';
    }
  };

  // Determina colore in base alla città per avere un'esperienza visiva coerente
  const getCityColor = (city) => {
    const cityColors = {
      'Milano': 'bg-gradient-to-br from-blue-600 to-blue-800',
      'Roma': 'bg-gradient-to-br from-amber-600 to-red-800',
      'Firenze': 'bg-gradient-to-br from-purple-600 to-purple-800',
      'Torino': 'bg-gradient-to-br from-slate-600 to-slate-800',
      'Madrid': 'bg-gradient-to-br from-red-600 to-red-800',
      'Barcellona': 'bg-gradient-to-br from-orange-600 to-red-700',
      'Valencia': 'bg-gradient-to-br from-amber-500 to-orange-700',
      'Siviglia': 'bg-gradient-to-br from-green-600 to-green-800'
    };
    
    return cityColors[city] || 'bg-gradient-to-br from-gray-600 to-gray-800';
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="overflow-hidden animate-pulse">
            <div className="w-full h-48 bg-gray-200"></div>
            <CardContent className="p-4">
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    console.error("Errore nel caricamento degli annunci:", error);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {listings.map(listing => (
        <Link 
          href={listing.isDemo ? "#" : `/annunci/${listing.id}`}
          key={listing.id}
          className="group"
        >
          <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-lg">
            <div className={`relative w-full h-48 ${getCityColor(listing.city)} text-white flex flex-col justify-end p-4`}>
              <div className="absolute inset-0 opacity-20 bg-center bg-cover mix-blend-overlay"
                   style={{ backgroundImage: `url('/images/pattern-${listing.city.toLowerCase()}.svg')` }} />
              
              <div className="relative z-10">
                <h3 className="font-semibold text-xl mb-1 drop-shadow-md">
                  {listing.title}
                </h3>
                <div className="flex items-center text-sm opacity-90">
                  <MapPin className="h-3.5 w-3.5 mr-1" />
                  <span>{listing.city}{listing.zone ? `, ${listing.zone}` : ''}</span>
                </div>
              </div>
              
              {listing.isDemo && (
                <Badge className="absolute top-2 right-2 bg-amber-400 text-amber-900">
                  Annuncio Demo
                </Badge>
              )}
              
              <Badge className={`absolute top-2 left-2 ${getPropertyTypeColor(listing.propertyType)} text-white`}>
                <span className="flex items-center">
                  {getPropertyTypeIcon(listing.propertyType)}
                  <span className="ml-1">{getPropertyTypeLabel(listing.propertyType)}</span>
                </span>
              </Badge>
            </div>
            
            <CardContent className="p-4">
              <p className="text-sm line-clamp-2 mb-3 text-muted-foreground">
                {listing.description}
              </p>
              
              <div className="flex flex-wrap gap-1 mb-3">
                {listing.features.slice(0, 3).map((feature, index) => (
                  <Badge key={index} variant="outline" className="text-xs bg-gray-50">
                    {getFeatureLabel(feature)}
                  </Badge>
                ))}
                {listing.features.length > 3 && (
                  <Badge variant="outline" className="text-xs bg-gray-50">
                    +{listing.features.length - 3}
                  </Badge>
                )}
              </div>
            </CardContent>
            
            <CardFooter className="p-4 pt-0 flex justify-between items-center border-t">
              <div className="flex items-center text-primary font-semibold">
                <Euro className="h-4 w-4 mr-1" />
                <span>{listing.price}</span>
                <span className="text-xs text-muted-foreground font-normal ml-1">/mese</span>
              </div>
              
              <div className="text-sm text-muted-foreground">
                {listing.squareMeters} m²
              </div>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  );
}