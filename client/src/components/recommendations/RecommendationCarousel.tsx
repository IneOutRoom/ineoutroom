import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Property } from "@shared/schema";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ChevronLeft, ChevronRight, Star, Building, MapPin, Euro } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePropertyInteractions } from "@/hooks/use-property-interactions";
import { useAuth } from "@/hooks/use-auth";

export function RecommendationCarousel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { recordView, recordSave, recordContact } = usePropertyInteractions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Query per ottenere le proprietà raccomandate
  const { data: recommendedProperties, isLoading, error } = useQuery<Property[]>({
    queryKey: ["/api/recommendations"],
    queryFn: () => fetch("/api/recommendations?limit=10").then(res => {
      if (!res.ok) throw new Error("Errore durante il recupero delle raccomandazioni");
      return res.json();
    }),
    enabled: !!user, // Esegui la query solo se l'utente è autenticato
    staleTime: 5 * 60 * 1000, // 5 minuti
  });

  // Gestione dell'errore
  if (error) {
    console.error("Errore durante il caricamento delle raccomandazioni:", error);
  }

  // Funzioni per scorrere il carosello
  const scrollPrev = () => {
    if (containerRef.current && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const scrollNext = () => {
    if (containerRef.current && recommendedProperties && currentIndex < recommendedProperties.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // Effetto per scorrere il carosello quando cambia currentIndex
  useEffect(() => {
    if (containerRef.current && recommendedProperties && recommendedProperties.length > 0) {
      const cardWidth = containerRef.current.querySelector(".recommendation-card")?.clientWidth || 0;
      const scrollPosition = cardWidth * currentIndex;
      containerRef.current.scrollTo({
        left: scrollPosition,
        behavior: "smooth"
      });
    }
  }, [currentIndex, recommendedProperties]);

  // Gestisci il click sulla proprietà
  const handlePropertyClick = async (property: Property) => {
    await recordView(property);
  };

  // Gestisci il salvataggio della proprietà
  const handleSaveProperty = async (e: React.MouseEvent, property: Property) => {
    e.preventDefault();
    e.stopPropagation();
    
    const success = await recordSave(property);
    
    if (success) {
      toast({
        title: "Proprietà salvata",
        description: "La proprietà è stata aggiunta ai tuoi preferiti",
      });
    }
  };

  // Gestisci il contatto con il proprietario
  const handleContactOwner = async (e: React.MouseEvent, property: Property) => {
    e.preventDefault();
    e.stopPropagation();
    
    const success = await recordContact(property);
    
    if (success) {
      toast({
        title: "Azione registrata",
        description: "La tua richiesta di contatto è stata inviata",
      });
    }
  };

  // Se l'utente non è autenticato o non ci sono proprietà, non mostrare nulla
  if (!user || (!isLoading && (!recommendedProperties || recommendedProperties.length === 0))) {
    return null;
  }

  return (
    <div className="relative w-full py-8 bg-muted/30">
      <div className="container">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" /> 
            Consigliati per te
          </h2>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={scrollPrev}
              disabled={currentIndex === 0 || isLoading}
              className="rounded-full"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={scrollNext}
              disabled={!recommendedProperties || currentIndex >= recommendedProperties.length - 1 || isLoading}
              className="rounded-full"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div 
            ref={containerRef}
            className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-6"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {recommendedProperties?.map((property, index) => (
              <div 
                key={property.id} 
                className={cn(
                  "recommendation-card flex-shrink-0 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 px-2 snap-start",
                  currentIndex === index ? "opacity-100" : "opacity-80"
                )}
              >
                <Link href={`/properties/${property.id}`} onClick={() => handlePropertyClick(property)}>
                  <Card className="h-full hover:shadow-md transition-all cursor-pointer">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <Badge className="mb-1">
                          <Building className="h-3 w-3 mr-1" />
                          {property.propertyType.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline" className="bg-primary/10">
                          <Euro className="h-3 w-3 mr-1" />
                          {property.price ? (property.price / 100).toLocaleString('it-IT', {
                            style: 'currency',
                            currency: 'EUR',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                          }) : '0€'}/mese
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
                        Contatta
                      </Button>
                    </CardFooter>
                  </Card>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}