import { useSimilarProperties } from "@/hooks/use-similar-properties";
import { usePropertyInteractions } from "@/hooks/use-property-interactions";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Property } from "@shared/schema";
import { formatDate } from "@/lib/utils";
import { ArrowUpRight, Building, Calendar, Euro, MapPin } from "lucide-react";
import { Link } from "wouter";

interface SimilarPropertiesProps {
  propertyId: number;
}

export function SimilarProperties({ propertyId }: SimilarPropertiesProps) {
  const { similarProperties, isLoading } = useSimilarProperties(propertyId);
  const { handlePropertyClick, handleSaveProperty, handleContactOwner } = usePropertyInteractions();

  // Se non ci sono proprietà simili e il caricamento è terminato, non mostrare nulla
  if (!isLoading && similarProperties.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 space-y-4">
      <h2 className="text-2xl font-bold">Proprietà simili</h2>
      <p className="text-muted-foreground">Altre opzioni che potrebbero interessarti</p>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Skeleton className="h-9 w-16" />
                <Skeleton className="h-9 w-24" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {similarProperties.map((property) => (
            <Link 
              key={property.id} 
              href={`/properties/${property.id}`}
              onClick={() => handlePropertyClick(property)}
            >
              <Card className="h-full cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <Badge className="mb-1">
                      <Building className="h-3 w-3 mr-1" />
                      {property.propertyType.replace('_', ' ')}
                    </Badge>
                    <Badge variant="outline" className="bg-primary/10">
                      <Euro className="h-3 w-3 mr-1" />
                      {property.price} /mese
                    </Badge>
                  </div>
                  <CardTitle className="text-base line-clamp-1 mt-2" title={property.title}>
                    {property.title}
                  </CardTitle>
                  <CardDescription className="flex items-center text-xs">
                    <MapPin className="h-3 w-3 mr-1" />
                    {property.city}{property.zone ? `, ${property.zone}` : ''}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pb-2">
                  <p className="text-xs line-clamp-2 text-muted-foreground">
                    {property.description}
                  </p>
                </CardContent>
                
                <CardFooter className="pt-0 flex justify-between">
                  <Button 
                    size="sm" 
                    variant="ghost"
                    className="text-xs px-2 h-8"
                    onClick={(e) => handleSaveProperty(e, property)}
                  >
                    Salva
                  </Button>
                  <Button 
                    size="sm"
                    className="text-xs px-2 h-8"
                    onClick={(e) => handleContactOwner(e, property)}
                  >
                    Contatta <ArrowUpRight className="ml-1 h-3 w-3" />
                  </Button>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}