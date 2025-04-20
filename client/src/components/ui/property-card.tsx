import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Wifi, Wind, Home, Users, Bath, Ruler, Utensils, Network } from 'lucide-react';
import { propertyTypeEnum } from '@shared/schema';
import { Link } from 'wouter';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { getPlaceholderUrl } from '@/utils/image-optimizer';

interface PropertyFeature {
  icon: React.ReactNode;
  text: string;
}

interface PropertyCardProps {
  id: number;
  title: string;
  propertyType: (typeof propertyTypeEnum.enumValues)[number];
  price: number;
  city: string;
  zone?: string;
  imageUrl: string;
  features: PropertyFeature[];
  hostName: string;
  hostImage: string;
  timeAgo: string;
  isNew?: boolean;
  onFavoriteClick?: (id: number) => void;
  isFavorite?: boolean;
  hideActions?: boolean;
}

// Utilizziamo React.memo per ottimizzare le performance ed evitare re-render inutili
export const PropertyCard = React.memo(function PropertyCard({
  id,
  title,
  propertyType,
  price,
  city,
  zone,
  imageUrl,
  features,
  hostName,
  hostImage,
  timeAgo,
  isNew = false,
  onFavoriteClick,
  isFavorite = false,
  hideActions = false,
}: PropertyCardProps) {
  // Mappa dei tipi di proprietà in italiano
  const propertyTypeMap: Record<string, string> = {
    stanza_singola: 'Stanza singola',
    stanza_doppia: 'Stanza doppia',
    monolocale: 'Monolocale',
    bilocale: 'Bilocale',
    altro: 'Altra tipologia',
  };

  // Funzione che renderizza le icone delle feature
  const renderFeatureIcon = (feature: PropertyFeature) => {
    return (
      <div key={feature.text} className="flex items-center text-xs text-neutral-500">
        {feature.icon}
        <span className="ml-1">{feature.text}</span>
      </div>
    );
  };

  return (
    <Card className="property-card overflow-hidden mb-6 border border-neutral-200 relative transition-all duration-300 hover:-translate-y-1 hover:shadow-primary">
      {isNew && (
        <div className="absolute top-3 left-3 z-10">
          <Badge variant="destructive" className="text-xs font-bold px-3 py-1 rounded-full shadow-md">
            NUOVO
          </Badge>
        </div>
      )}
      
      <div className="flex flex-col md:flex-row">
        <div className="relative h-48 md:h-auto md:w-2/5 overflow-hidden">
          <Link href={`/properties/${id}`}>
            <OptimizedImage 
              src={imageUrl} 
              alt={title || "Immagine proprietà"} 
              className="w-full h-full cursor-pointer"
              objectFit="cover"
              lazy={true}
              placeholderSrc={getPlaceholderUrl('property')}
              blur={true}
            />
          </Link>
          {!hideActions && (
            <Button 
              size="icon"
              variant="ghost" 
              className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md hover:bg-white hover:text-accent"
              onClick={() => onFavoriteClick && onFavoriteClick(id)}
            >
              <Heart className={isFavorite ? "fill-red-500 text-red-500" : ""} size={20} />
            </Button>
          )}
        </div>
        
        <CardContent className="p-5 md:w-3/5">
          <div className="flex justify-between">
            <div>
              <Badge variant="outline" className="bg-primary/10 text-primary border-0 text-xs font-medium px-2 py-1 rounded shadow-md">
                {propertyTypeMap[propertyType]}
              </Badge>
              <h3 className="font-montserrat font-semibold text-lg mt-2 card-title">
                <Link href={`/properties/${id}`} className="hover:text-primary transition-colors">
                  {title}
                </Link>
              </h3>
            </div>
            <div className="text-xl font-bold text-accent card-title">
              €{price}<span className="text-xs font-normal text-neutral-500">/mese</span>
            </div>
          </div>
          
          <p className="text-sm text-neutral-500 mt-2">
            {city} {zone && <span>• <span className="text-primary-dark">{zone}</span></span>}
          </p>
          
          <div className="flex flex-wrap gap-3 mt-4">
            {features.map(renderFeatureIcon)}
          </div>
          
          <div className="flex justify-between items-center mt-5 pt-4 border-t border-neutral-100">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full overflow-hidden">
                <OptimizedImage 
                  src={hostImage} 
                  alt={hostName || "Immagine host"} 
                  width={32}
                  height={32}
                  objectFit="cover"
                  lazy={true}
                  placeholderSrc={getPlaceholderUrl('host')}
                  blur={true}
                />
              </div>
              <span className="ml-2 text-sm font-medium">
                Pubblicato da <span className="text-primary-dark">{hostName}</span>
              </span>
            </div>
            <div className="flex items-center gap-1 text-neutral-500">
              <span className="text-xs">{timeAgo}</span>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
});
